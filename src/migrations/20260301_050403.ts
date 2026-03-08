import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "todo" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"completed" boolean DEFAULT false NOT NULL,
  	"user_id" uuid NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "todo_id" uuid;
  ALTER TABLE "todo" ADD CONSTRAINT "todo_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "todo_user_idx" ON "todo" USING btree ("user_id");
  CREATE INDEX "todo_created_at_idx" ON "todo" USING btree ("created_at");
  CREATE INDEX "todo_updated_at_idx" ON "todo" USING btree ("updated_at");
  CREATE INDEX "todo_deleted_at_idx" ON "todo" USING btree ("deleted_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_todo_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todo"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_todo_id_idx" ON "payload_locked_documents_rels" USING btree ("todo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "todo" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "todo" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_todo_fk";
  
  DROP INDEX "payload_locked_documents_rels_todo_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "todo_id";`)
}
