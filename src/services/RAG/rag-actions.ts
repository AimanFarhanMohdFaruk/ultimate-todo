'use server';

import { getPath } from 'pdf-parse/worker';
import type { IngestResult, QueryResult } from './rag-types';
import { PDFParse } from 'pdf-parse';
PDFParse.setWorker(getPath());

/**
 * Ingest document text: chunk, embed, and store.
 * Phase 1: Implement chunking, call embeddings API, store chunks + vectors here or in your DB.
 */
export async function ingestDocument(
  text: string,
  documentTitle?: string,
  sourceFile?: File | null,
): Promise<IngestResult> {
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
  console.log(textToChunk);

  return {
    success: true,
    message: `Stored as. Implement Phase 1: add chunking, embeddings, and your chosen storage.`,
    chunkCount: 1,
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
