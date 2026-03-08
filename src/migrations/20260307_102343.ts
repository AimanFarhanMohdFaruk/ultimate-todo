import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "rag_chunks" (
  	"id" serial NOT NULL,
  	"document_id" uuid NOT NULL,
  	"chunk_index" integer NOT NULL,
  	"text" text NOT NULL,
  	"embedding" vector(3072) NOT NULL,
  	"document_title" text,
  	"created_at" timestamp DEFAULT now() NOT NULL
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "rag_chunks" CASCADE;`)
}
