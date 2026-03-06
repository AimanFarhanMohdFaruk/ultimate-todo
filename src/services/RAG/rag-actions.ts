import { PrivateUpload } from '@/payload-types';
import type { IngestResult, QueryResult, RagChunk } from './rag-types';

/**
 * In-memory store for the RAG demo (learning only).
 * Replace with real storage when you implement Phase 1 (e.g. vector DB, Postgres + pgvector).
 */
const chunksStore: RagChunk[] = [];
let documentCounter = 0;

/**
 * Ingest document text: chunk, embed, and store.
 * Phase 1: Implement chunking, call embeddings API, store chunks + vectors here or in your DB.
 */
export async function ingestDocument(
  text: string,
  documentTitle?: string,
  sourceFile?: PrivateUpload | null,
): Promise<IngestResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, message: 'Please enter some text to ingest.' };
  }

  // Placeholder: store one "chunk" (whole text) so the demo has something to show.
  // Phase 1: Replace with real chunking (e.g. by size/overlap), then embed each chunk, then store.
  documentCounter += 1;
  const docId = `doc-${documentCounter}`;
  chunksStore.push({
    id: `${docId}_0`,
    text: trimmed.slice(0, 2000),
    documentId: docId,
    documentTitle: documentTitle ?? `Document ${documentCounter}`,
    chunkIndex: 0,
  });

  return {
    success: true,
    message: `Stored as "${documentTitle ?? docId}". Implement Phase 1: add chunking, embeddings, and your chosen storage.`,
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
  const sources = chunksStore.slice(-5).map((c) => ({
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    text: c.text.slice(0, 300),
    chunkIndex: c.chunkIndex,
  }));

  return {
    answer:
      chunksStore.length > 0
        ? 'Implement Phase 2 (retrieval) and Phase 3 (generation) to see answers from your documents here.'
        : 'Ingest at least one document (Phase 1), then implement retrieval and generation.',
    sources,
  };
}
