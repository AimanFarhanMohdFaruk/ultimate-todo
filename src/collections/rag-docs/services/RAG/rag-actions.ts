'use server';

import { getPath } from 'pdf-parse/worker';
import type { IngestResult, QueryResult, RagChunk } from './rag-types';
import { PDFParse } from 'pdf-parse';
import { getPayload } from '@/lib/payload/get-payload';
import { currentUser } from '@/lib/auth/context/get-context-props';
import { ragChunksTable } from '@/collections/rag-docs/rag-chunks-table';
import { embedTexts, EMBEDDING_DIM } from '@/lib/ai';
PDFParse.setWorker(getPath());

/**
 * Ingest document text: chunk, embed, and store.
 * Phase 1: Implement chunking, call embeddings API, store chunks + vectors here or in your DB.
 */
export async function ingestDocument(
  text: string,
  documentTitle: string,
  sourceFile?: File | null,
): Promise<IngestResult> {
  const payload = await getPayload();
  const user = await currentUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  const trimmed = text.trim();
  if (!trimmed && !sourceFile) {
    return { success: false, message: 'Please enter some text to ingest.' };
  }
  let textToChunk: string[];

  if (sourceFile) {
    textToChunk = await extractTextFromPDF(sourceFile);
  } else {
    textToChunk = [text];
  }

  const saveDoc = await payload.create({
    collection: 'rag-docs',
    data: {
      title: documentTitle,
      content: text,
      user: user.id,
    },
  });

  if (!saveDoc) {
    return { success: false, message: 'Failed to save document' };
  }

  // Chunk and store
  const chunks = await chunkTexts(textToChunk, saveDoc.id, documentTitle);

  await payload.db.drizzle.insert(ragChunksTable).values(
    chunks.map((chunk) => ({
      document_id: chunk.documentId,
      chunk_index: chunk.chunkIndex,
      text: chunk.text,
      embedding: chunk.embedding ?? new Array(EMBEDDING_DIM).fill(0),
      document_title: chunk.documentTitle ?? null,
    })),
  );

  return {
    success: true,
    message: `Ingested "${documentTitle}": ${chunks.length} chunk(s) stored.`,
    chunkCount: chunks.length,
  };
}

/**
 * Query: embed question, retrieve relevant chunks, generate answer with citations.
 * Phase 2: Implement query embedding and vector (or hybrid) search.
 * Phase 3: Implement context building + LLM call.
 * Phase 4: Add source metadata and citations in the response.
 */
export async function queryRag(question: string): Promise<QueryResult> {
  const q = question.trim();
  if (!q) {
    return {
      answer: 'Please enter a question.',
      sources: [],
    };
  }

  // Placeholder: return last few stored chunks as "sources" and a static message.
  // Phase 2: Embed the question, run similarity search over stored chunks, return top-k.
  // Phase 3: Build context from retrieved chunks, call LLM, return answer.
  // Phase 4: Format sources with doc title and map citations to chunks.
  return {
    answer:
      'Implement Phase 2 (retrieval) and Phase 3 (generation) to see answers from your documents here.',
    sources: [],
  };
}

async function extractTextFromPDF(document: File): Promise<string[]> {
  const arrayBuffer = await document.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const parser = new PDFParse({ data: buffer });
  const text = await parser.getText();
  parser.destroy();
  return text.pages.map((page) => page.text);
}

async function chunkTexts(
  texts: string[],
  documentId: string,
  documentTitle: string,
): Promise<RagChunk[]> {
  const embeddings = await embedTexts(texts);
  return texts.map((text, i) => ({
    id: `chunk-${i}`,
    text,
    documentId,
    embedding: embeddings[i],
    documentTitle,
    chunkIndex: i,
  }));
}
