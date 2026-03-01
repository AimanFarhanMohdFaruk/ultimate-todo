import { getPayload } from '@/lib/payload/get-payload';
import { clearTestDb } from '../helper/clear-test-db';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert';

let payload: Awaited<ReturnType<typeof getPayload>>;

beforeEach(async () => {
  payload = await getPayload();
  const user = await payload.create({
    collection: 'users',
    data: {
      email: 'test@test.com',
      name: 'Test User',
      role: ['admin'],
      emailVerified: true,
    },
  });
  await payload.create({
    collection: 'todo',
    data: {
      title: 'Test Todo',
      description: 'Test Description',
      completed: false,
      dueDate: new Date().toISOString(),
      user: user.id,
    },
  });
});

afterEach(async () => {
  await clearTestDb(payload);
  process.exit(0);
});

test('Todo collection check', async () => {
  const result = await payload.find({ collection: 'todo', limit: 1 });
  assert.ok(result.docs instanceof Array);
  assert.ok(result.docs.length > 0);
  assert.ok(result.docs[0].title === 'Test Todo');
});
