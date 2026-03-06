import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "rag_docs" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"content" varchar NOT NULL,
  	"user_id" uuid NOT NULL,
  	"source_file_id" uuid,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rag_docs_id" uuid;
  ALTER TABLE "rag_docs" ADD CONSTRAINT "rag_docs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rag_docs" ADD CONSTRAINT "rag_docs_source_file_id_private_uploads_id_fk" FOREIGN KEY ("source_file_id") REFERENCES "public"."private_uploads"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "rag_docs_user_idx" ON "rag_docs" USING btree ("user_id");
  CREATE INDEX "rag_docs_source_file_idx" ON "rag_docs" USING btree ("source_file_id");
  CREATE INDEX "rag_docs_created_at_idx" ON "rag_docs" USING btree ("created_at");
  CREATE INDEX "rag_docs_updated_at_idx" ON "rag_docs" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rag_docs_fk" FOREIGN KEY ("rag_docs_id") REFERENCES "public"."rag_docs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_rag_docs_id_idx" ON "payload_locked_documents_rels" USING btree ("rag_docs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "rag_docs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "rag_docs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rag_docs_fk";
  
  DROP INDEX "payload_locked_documents_rels_rag_docs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rag_docs_id";`)
}
