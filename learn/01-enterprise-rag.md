### Enterprise RAG – Implementation To‑Do Guide

You’ll use this as your personal checklist while working through the **Enterprise RAG System** case study.

---

## 0. Orientation

- **[ ]** Read `content/case-studies/01-enterprise-rag.md` once end‑to‑end.
- **[ ]** Re-read and sketch the **high-level architecture** section (UI → API → Query Service → Retrieval / Reranking / Generation → Data Layer).
- **[ ]** Open the demo shell at `src/app/(frontend)/dashboard/case-studies/demos/01-enterprise-rag-demo.tsx` and understand:
  - **[ ]** What happens when you ingest a document (which server action is called).
  - **[ ]** What happens when you ask a question (which server action is called).
  - **[ ]** How `rag-actions.ts` and `rag-types.ts` are used.

---

## Phase 1 – Ingestion & Storage (Get text in and out)

**Goal:** You can ingest raw text, turn it into chunks with embeddings, and store those chunks for later search.

### 1.1 Understand the ingestion pipeline (from case study)

- **[x]** Re-read **“Document Ingestion Pipeline”** in the case study and summarize for yourself:
  - **[x]** Why we parse and clean documents.
  - **[x]** Why we chunk (context size, retrieval granularity).
  - **[x]** Why we embed and what an embedding vector is.
  - **[x]** What metadata is stored (doc id, department, access level, timestamps, etc.).
- **[x]** In your own words, write 3–5 bullet points: “What my minimal ingestion pipeline needs to do for the demo.”

### 1.2 Decide your learning-time storage

- **[B]** Decide where you will store chunks and vectors for the demo:
  - Option A: in‑memory arrays in `rag-actions.ts` (simplest, resets on restart).
  - Option B: a local DB (e.g. SQLite / Postgres + pgvector) for more realism.
- **[ ]** Note pros/cons of your choice (speed, persistence, complexity).

### 1.3 Implement chunking

In `rag-actions.ts` (and using `RagChunk` in `rag-types.ts`):

- **[ ]** Design a **chunking strategy**:
  - **[ ]** Choose a target chunk size (e.g. ~400–600 tokens or words).
  - **[ ]** Choose an overlap (e.g. 50–100 tokens/words).
- **[ ]** Implement a pure function, e.g. `chunkText(text: string): RagChunk[]` that:
  - **[ ]** Splits the text into chunks.
  - **[ ]** Assigns `chunkIndex` and `id` (e.g. `doc-1_0`, `doc-1_1`, …).
  - **[ ]** Fills `documentId` and `documentTitle`.
- **[ ]** Update `ingestDocument` to:
  - **[ ]** Use `chunkText` instead of creating one big chunk.
  - **[ ]** Store all chunks in your chosen store (in‑memory or DB).
  - **[ ]** Return a meaningful `chunkCount`.

**Self-check questions to ask me:**

- “Is my chunking strategy reasonable for RAG?”
- “How would you improve this chunking function?”

### 1.4 Integrate embeddings (text → vector)

- **[ ]** Choose an embeddings provider (e.g. OpenAI `text-embedding-3-large`, or an equivalent from the case study table).
- **[ ]** Set up environment variables and client config (API key, model name).
- **[ ]** Implement a helper in `rag-actions.ts`, e.g. `embedTexts(texts: string[]): Promise<number[][]>` that:
  - **[ ]** Takes an array of chunk texts.
  - **[ ]** Calls the embeddings API once (batched).
  - **[ ]** Returns an array of vectors.
- **[ ]** In `ingestDocument`:
  - **[ ]** After chunking, call `embedTexts` for all chunks.
  - **[ ]** Attach the vectors to each `RagChunk.embedding`.
  - **[ ]** Persist both text and embedding.

**Self-check questions to ask me:**

- “Is my embeddings API usage correct for batching?”
- “Is it okay that I store embeddings as `number[]` like this?”

### 1.5 Validate ingestion

- **[ ]** In the UI, ingest a small document and confirm:
  - **[ ]** The success toast message matches what’s actually stored.
- **[ ]** Log or inspect (temporarily) the stored `RagChunk[]` to verify:
  - **[ ]** Chunk count and sizes.
  - **[ ]** Embeddings exist and have consistent length.
  - **[ ]** Document metadata (`documentId`, `documentTitle`) is correct.

---

## Phase 2 – Retrieval (Find relevant chunks for a question)

**Goal:** Given a question, retrieve the most relevant chunks using vector similarity (and optionally hybrid search / RRF).

### 2.1 Understand retrieval from the case study

- **[ ]** Re-read **“Query Processing”** (steps 3–4) and **“Hybrid Retrieval”**.
- **[ ]** In your own words, explain:
  - **[ ]** How vector search works.
  - **[ ]** What hybrid retrieval is and why RRF helps.

### 2.2 Implement vector search

In `rag-actions.ts`:

- **[ ]** Implement a helper, e.g. `searchByVector(question: string, topK: number): RagChunk[]`:
  - **[ ]** Embed the question text using the same embeddings model as Phase 1.
  - **[ ]** Compute similarity between question embedding and each chunk embedding (cosine similarity or dot product).
  - **[ ]** Sort chunks by similarity and return the top K.
- **[ ]** Handle empty / missing embeddings gracefully (skip chunks without embeddings).

### 2.3 (Optional) Add hybrid search + RRF

- **[ ]** Implement a simple keyword path (e.g. filter chunks whose text contains any keyword from the question).
- **[ ]** Implement Reciprocal Rank Fusion (RRF) as in the case study:
  - **[ ]** Compute RRF scores from both vector and keyword rankings.
  - **[ ]** Merge into a single ranked list.
- **[ ]** Decide a default `topK` for the merged results (e.g. 10–20).

**Self-check questions to ask me:**

- “Can you review my cosine similarity code?”
- “Does this RRF implementation match the case study?”

### 2.4 Wire retrieval into `queryRag`

- **[ ]** Update `queryRag(question)` to:
  - **[ ]** Use `searchByVector` (or hybrid search) instead of returning the last chunks.
  - **[ ]** Convert the top chunks into `RagSource[]` (doc id, title, text snippet, chunkIndex).
- **[ ]** In the UI, ask a question and confirm the “Sources” list:
  - **[ ]** Is from the most relevant parts of your ingested doc.
  - **[ ]** Changes when you change the question.

---

## Phase 3 – Generation (Answer from retrieved context)

**Goal:** Use the retrieved chunks as context, build a prompt, and call an LLM to generate an answer grounded in that context.

### 3.1 Understand generation from the case study

- **[ ]** Re-read “Generation with Massive Context” and Query Processing steps 5–6.
- **[ ]** Summarize:
  - **[ ]** Why they build a context string from multiple chunks.
  - **[ ]** Why they tell the model to only use that context.

### 3.2 Build context from retrieved chunks

In `rag-actions.ts`:

- **[ ]** Implement a helper, e.g. `buildContext(chunks: RagChunk[]): string` that:
  - **[ ]** Concatenates top K chunks into a coherent context section.
  - **[ ]** Optionally labels them (e.g. “Source 1: …”, “Source 2: …”).

### 3.3 Implement LLM call

- **[ ]** Choose a general LLM (e.g. OpenAI, Anthropic, Gemini) for answering questions.
- **[ ]** Implement a helper, e.g. `generateAnswer(question: string, context: string): Promise<string>` that:
  - **[ ]** Builds a prompt like:  
    “Use only the following context to answer the question. If the answer isn’t in the context, say you don’t know. Context: … Question: …”.
  - **[ ]** Calls the model via its Node/HTTP SDK.
  - **[ ]** Returns the text of the answer.

### 3.4 Wire generation into `queryRag`

- **[ ]** Update `queryRag` to:
  - **[ ]** Run retrieval to get chunks.
  - **[ ]** Build context from those chunks.
  - **[ ]** Call `generateAnswer` and use that as `answer` in `QueryResult`.
  - **[ ]** Still return `sources` built from the same retrieved chunks.

**UI validation:**

- **[ ]** Ask a question that is clearly answered in the ingested text and confirm:
  - **[ ]** The answer in the UI matches the content.
  - **[ ]** The listed sources are where the answer came from.
- **[ ]** Ask something _not_ in the documents and confirm:
  - **[ ]** The model declines or hedges (per your prompt).

---

## Phase 4 – Citations & Polish

**Goal:** Connect the textual answer to specific chunks/sources and make the demo easy to inspect and reason about.

### 4.1 Source metadata

- **[ ]** Ensure `RagChunk` and `RagSource` include:
  - **[ ]** `documentId`, `documentTitle`, `chunkIndex`.
- **[ ]** Confirm `queryRag` maps retrieved chunks into `RagSource[]` consistently.

### 4.2 Citations strategy

Choose one strategy:

- **Strategy A (simpler):** List sources under the answer (already partly done in the UI).
  - **[ ]** Ensure the “Sources” list clearly ties to the answer (“Sources used to answer this question:”).
- **Strategy B (harder):** Inline citations like `[Source 1]` in the answer text.
  - **[ ]** Ask the LLM to output references (e.g. `[[Doc:chunk]]`).
  - **[ ]** Post-process these to map back to `RagSource` entries.

### 4.3 Final UI touches

- **[ ]** Make sure error/success messages are clear (“Ingest succeeded”, “No documents yet”, etc.).
- **[ ]** Add any small debug aids you find useful (e.g. show how many chunks exist, or a toggle to show full source text vs snippets).

---

## Phase 5 – Optional Enhancements (Reranking, Guardrails, Scale)

Once the core loop works end‑to‑end:

- **[ ]** Implement reranking using a smaller model (or simple heuristics) over the top N retrieved chunks.
- **[ ]** Add basic guardrails:
  - **[ ]** Reject clearly harmful / off-topic input.
  - **[ ]** Add a simple output check (e.g. detect if answer says something wildly off‑topic).
- **[ ]** Consider moving from in‑memory to a real vector DB or pgvector.
- **[ ]** Revisit the case study’s scaling and cost analysis to see how your design would evolve in production.

---
