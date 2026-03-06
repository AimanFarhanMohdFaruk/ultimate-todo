import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE "rag_chunks" (
      "id" text PRIMARY KEY,
      "document_id" uuid NOT NULL,
      "chunk_index" integer NOT NULL,
      "text" text NOT NULL,
      "embedding" vector(3072) NOT NULL,
      "document_title" varchar,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "rag_chunks"
      ADD CONSTRAINT "rag_chunks_document_id_rag_docs_id_fk"
      FOREIGN KEY ("document_id")
      REFERENCES "public"."rag_docs"("id")
      ON DELETE cascade
      ON UPDATE no action;

    CREATE INDEX "rag_chunks_document_id_idx"
      ON "rag_chunks" USING btree ("document_id");
  `);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "rag_chunks_embedding_ivfflat_idx";
    DROP INDEX IF EXISTS "rag_chunks_document_id_idx";
    ALTER TABLE "rag_chunks"
      DROP CONSTRAINT IF EXISTS "rag_chunks_document_id_rag_docs_id_fk";
    DROP TABLE IF EXISTS "rag_chunks" CASCADE;
  `);
}
