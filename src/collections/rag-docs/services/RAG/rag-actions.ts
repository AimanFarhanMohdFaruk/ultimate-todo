'use server'

import { EMBEDDING_DIM, embedTexts, generateAnswer } from '@/lib/ai'
import { currentUser } from '@/lib/auth/context/get-context-props'
import { getPayload } from '@/lib/payload/get-payload'

import { PDFParse } from 'pdf-parse'
import { getPath } from 'pdf-parse/worker'
import { ragChunksTable } from '@/collections/rag-docs/rag-chunks-table'
import type { IngestResult, QueryResult, RagChunk } from './rag-types'

PDFParse.setWorker(getPath())

/**
 * Ingest document text: chunk, embed, and store.
 * Phase 1: Implement chunking, call embeddings API, store chunks + vectors here or in your DB.
 */
export async function ingestDocument(
  text: string,
  documentTitle: string,
  sourceFile?: File | null
): Promise<IngestResult> {
  const payload = await getPayload()
  const user = await currentUser()

  if (!user) {
    return { success: false, message: 'Unauthorized' }
  }

  const trimmed = text.trim()
  if (!trimmed && !sourceFile) {
    return { success: false, message: 'Please enter some text to ingest.' }
  }
  let textToChunk: string[]

  if (sourceFile) {
    textToChunk = await extractTextFromPDF(sourceFile)
  } else {
    textToChunk = [text]
  }
  const saveDoc = await payload.create({
    collection: 'rag-docs',
    data: {
      title: documentTitle,
      content: sourceFile ? sourceFile.name : trimmed,
      user: user.id,
    },
  })

  if (!saveDoc) {
    return { success: false, message: 'Failed to save document' }
  }

  // Chunk and store
  const chunks = await chunkTexts(textToChunk, saveDoc.id, documentTitle)

  await payload.db.drizzle.insert(ragChunksTable).values(
    chunks.map((chunk) => ({
      document_id: chunk.documentId,
      chunk_index: chunk.chunkIndex,
      text: chunk.text,
      embedding: chunk.embedding ?? new Array(EMBEDDING_DIM).fill(0),
      document_title: chunk.documentTitle ?? null,
    }))
  )

  return {
    success: true,
    message: `Ingested "${documentTitle}": ${chunks.length} chunk(s) stored.`,
    chunkCount: chunks.length,
  }
}

/**
 * Query: embed question, retrieve relevant chunks, generate answer with citations.
 * Phase 2: Implement query embedding and vector (or hybrid) search.
 * Phase 3: Implement context building + LLM call.
 * Phase 4: Add source metadata and citations in the response.
 */
export async function queryRag(question: string): Promise<QueryResult> {
  const payload = await getPayload()
  const q = question.trim()
  if (!q) {
    return {
      answer: 'Please enter a question.',
      sources: [],
    }
  }

  const [questionVec] = await embedTexts([q])
  const vectorStr = '[' + questionVec.join(',') + ']'
  const TOP_K = 5

  const result = await payload.db.execute({
    drizzle: payload.db.drizzle,
    raw: `SELECT id, document_id, chunk_index, text, document_title FROM rag_chunks ORDER BY embedding <=> '${vectorStr}'::vector LIMIT ${TOP_K}`,
  })

  const rows = (result?.rows ?? []) as Array<{
    id: number
    document_id: string
    chunk_index: number
    text: string
    document_title: string | null
  }>

  if (rows.length === 0) {
    return {
      answer: 'No relevant documents found. Ingest some documents first, then ask a question.',
      sources: [],
    }
  }

  const context = rows.map((r) => r.text).join('\n\n')
  const answer = await generateAnswer(context, q)

  return {
    answer,
    sources: rows.map((r) => ({
      documentId: r.document_id,
      documentTitle: r.document_title ?? undefined,
      text: r.text,
      chunkIndex: r.chunk_index,
    })),
  }
}

async function extractTextFromPDF(document: File): Promise<string[]> {
  const arrayBuffer = await document.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const parser = new PDFParse({ data: buffer })
  const text = await parser.getText()
  parser.destroy()
  return text.pages.map((page: { text: string }) => page.text)
}

async function chunkTexts(
  texts: string[],
  documentId: string,
  documentTitle: string
): Promise<RagChunk[]> {
  const embeddings = await embedTexts(texts)
  return texts.map((text, i) => ({
    id: `chunk-${i}`,
    text,
    documentId,
    embedding: embeddings[i],
    documentTitle,
    chunkIndex: i,
  }))
}
