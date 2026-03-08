import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { Blog } from './collections/blog';
import { GlobalFooter, GlobalPrivacy, GlobalTerms } from './collections/global';
import { PayloadUploads } from './collections/uploads/payload-uploads';
import { PrivateUploads } from './collections/uploads/private-uploads';
import { Users } from './collections/users';
import { defaultLexical } from './fields/default-lexical';
import { getEmailAdapter } from './lib/email-adapter';
import { getServerSideURL } from './lib/payload';
import { plugins } from './plugins';
import { Todo } from './collections/todo';
import { RagDocs } from './collections/rag-docs';
import { ragChunksTable } from './collections/rag-docs/rag-chunks-table';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    components: {
      graphics: {
        Icon: {
          path: '@/components/payload/admin-icon.tsx',
        },
        Logo: {
          path: '@/components/payload/admin-logo.tsx',
        },
      },
    },
  },
  email: getEmailAdapter(),
  collections: [Users, Blog, PayloadUploads, PrivateUploads, Todo, RagDocs],
  editor: defaultLexical,
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    idType: 'uuid',
    push: false,
    beforeSchemaInit: [
      ({ schema }) => {
        return {
          ...schema,
          tables: {
            ...schema.tables,
            rag_chunks: ragChunksTable,
          },
        };
      },
    ],
  }),
  cors: [getServerSideURL()].filter(Boolean),
  sharp,
  plugins,
  globals: [GlobalFooter, GlobalTerms, GlobalPrivacy],
  serverURL: getServerSideURL(),
  jobs: {
    tasks: [
      {
        slug: 'checkTasksDue',
        outputSchema: [
          { name: 'dueCount', type: 'number' },
          { name: 'dueTitles', type: 'json' },
        ],
        handler: async ({ req }) => {
          const now = new Date().toISOString();
          const result = await req.payload.find({
            collection: 'todo',
            where: {
              dueDate: { less_than_equal: now },
              completed: { equals: false },
            },
            limit: 100,
          });
          return {
            output: {
              dueCount: result.totalDocs,
              dueTitles: result.docs.map((doc) => doc.title as string),
            },
          };
        },
      },
    ],
  },
});
