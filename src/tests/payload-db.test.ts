import { getPayload } from '@/lib/payload/get-payload'

import assert from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'
import { clearTestDb } from './helper/clear-test-db'

let payload: Awaited<ReturnType<typeof getPayload>>

beforeEach(async () => {
  payload = await getPayload()
  await payload.create({
    collection: 'blog',
    data: { title: 'Test Blog Post' },
    draft: true,
  })
})

afterEach(async () => {
  await clearTestDb(payload)
  process.exit(0)
})

test('Payload DB check', async () => {
  const result = await payload.find({ collection: 'blog', limit: 1 })
  assert.ok(result.docs instanceof Array)
  assert.ok(result.docs.length > 0)
  assert.ok(result.docs[0].title === 'Test Blog Post')
})
