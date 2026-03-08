import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  vector,
} from '@payloadcms/db-postgres/drizzle/pg-core';

/**
 * Shared rag_chunks table definition for Drizzle.
 * Used in payload.config beforeSchemaInit and in rag-actions for inserts.
 */
export const ragChunksTable = pgTable('rag_chunks', {
  id: serial('id').notNull(),
  document_id: uuid('document_id').notNull(),
  chunk_index: integer('chunk_index').notNull(),
  text: text('text').notNull(),
  embedding: vector('embedding', { dimensions: 1024 }).notNull(),
  document_title: text('document_title'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
