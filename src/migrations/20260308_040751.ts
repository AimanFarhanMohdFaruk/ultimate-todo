import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "rag_chunks" ALTER COLUMN "embedding" SET DATA TYPE vector(1024);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "rag_chunks" ALTER COLUMN "embedding" SET DATA TYPE vector(3072);`)
}
