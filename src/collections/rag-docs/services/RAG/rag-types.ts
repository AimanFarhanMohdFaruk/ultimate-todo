/**
 * Types for the Enterprise RAG demo.
 * Use these as you implement Phase 1–4 (chunking, retrieval, generation, citations).
 */

export type RagChunk = {
  id: string
  text: string
  documentId: string
  documentTitle?: string
  chunkIndex: number
  /** Embedding vector — add when you implement Phase 1 (embeddings API). */
  embedding?: number[]
}

export type IngestResult = {
  success: boolean
  message: string
  /** Chunks created — set when you implement Phase 1. */
  chunkCount?: number
}

export type RagSource = {
  documentId: string
  documentTitle?: string
  text: string
  chunkIndex?: number
}

export type QueryResult = {
  answer: string
  sources: RagSource[]
}
