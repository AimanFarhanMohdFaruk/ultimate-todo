import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Change rag_chunks.embedding from vector(3072) to vector(1024) for Hugging Face BAAI/bge-large-en-v1.5.
 * Run only if you have no existing embedding data, or after truncating rag_chunks.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rag_chunks"
      ALTER COLUMN "embedding" TYPE vector(1024);
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rag_chunks"
      ALTER COLUMN "embedding" TYPE vector(3072);
  `);
}
