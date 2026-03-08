/**
 * Central AI helpers: embeddings (Hugging Face), and placeholders for generation.
 * Set HUGGINGFACE_ACCESS_TOKEN in .env for embeddings.
 */

import { InferenceClient } from '@huggingface/inference';

const EMBEDDING_MODEL = 'BAAI/bge-large-en-v1.5';
/** Dimension of vectors from EMBEDDING_MODEL. Must match rag_chunks.embedding column. */
export const EMBEDDING_DIM = 1024;

let hfClient: InferenceClient | null = null;

function getHfClient(): InferenceClient {
  if (!hfClient) {
    const token = process.env.HUGGINGFACE_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        'HUGGINGFACE_ACCESS_TOKEN is required for embeddings. Set it in .env.',
      );
    }
    hfClient = new InferenceClient(token);
  }
  return hfClient;
}

/**
 * Embed a single text. For multiple texts, prefer embedTexts for batching.
 */
export async function embedText(text: string): Promise<number[]> {
  const result = await getHfClient().featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text,
  });
  const vec = toVector(result);
  return vec.map(Number);
}

/**
 * Embed multiple texts in one request. Returns one vector per input, in order.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const result = await getHfClient().featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: texts,
  });
  const rows = toVectors(result);
  return rows.map((r) => r.map(Number));
}

/** API returns number[] for one input or number[][] for many. */
function toVector(value: unknown): number[] {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    return (Array.isArray(first) ? first : value).map(Number);
  }
  throw new Error('Unexpected embedding response shape');
}

function toVectors(value: unknown): number[][] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((row) =>
      Array.isArray(row) ? row.map(Number) : [Number(row)],
    );
  }
  throw new Error('Unexpected embedding response shape');
}
