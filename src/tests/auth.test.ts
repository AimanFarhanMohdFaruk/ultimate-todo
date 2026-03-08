/**
 * Auth helper test: asUser creates a user via Better Auth signUpEmail (user + account),
 * signs in, and the returned headers are accepted by payload.auth({ headers }).
 */
import { getPayload } from '@/lib/payload/get-payload'

import assert from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'
import { asUser } from './helper/auth-helper'
import { clearTestDb } from './helper/clear-test-db'

let payload: Awaited<ReturnType<typeof getPayload>>

beforeEach(async () => {
  payload = await getPayload()
})

afterEach(async () => {
  await clearTestDb(payload)
  process.exit(0)
})

test('asUser returns user and headers; payload.auth({ headers }) recognises session', async () => {
  const { user, headers } = await asUser(payload, 'admin')
  assert.ok(user.id)
  assert.ok(user.email)
  assert.ok(headers.get('cookie')) // headers should contain session cookie
  assert.ok(headers.get('cookie')) // headers should contain session cookie
  console.log('HELLOOOOO')
  const { user: authUser } = await payload.auth({ headers })
  assert.ok(authUser)
  assert.strictEqual(authUser?.id, user.id)
  assert.strictEqual(authUser?.email, user.email)
})
