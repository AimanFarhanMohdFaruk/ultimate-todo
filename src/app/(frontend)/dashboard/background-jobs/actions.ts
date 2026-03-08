'use server'

import { currentUser } from '@/lib/auth/context/get-context-props'
import { getPayload } from '@/lib/payload/get-payload'

export async function checkTasksDue() {
  const payload = await getPayload()
  const user = await currentUser()

  if (!user) {
    throw new Error('User not found')
  }

  // Queue the job
  await payload.jobs.queue({
    task: 'checkTasksDue',
    input: {},
  })

  await payload.jobs.run()
  const jobs = await payload.find({
    collection: 'payload-jobs',
    where: {
      taskSlug: { equals: 'checkTasksDue' },
      completedAt: { exists: true },
    },
    sort: '-completedAt',
    limit: 1,
  })

  const latestJob = jobs.docs[0]

  const now = new Date().toISOString()
  const result = await payload.find({
    collection: 'todo',
    where: {
      dueDate: { less_than_equal: now },
      completed: { equals: false },
    },
    limit: 100,
  })

  return {
    dueCount: result.totalDocs,
    dueTitles: result.docs.map((doc) => doc.title as string),
    completedAt: latestJob?.completedAt,
  }
}

export async function seedSampleTodos() {
  const payload = await getPayload()
  const user = await currentUser()
  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()
  const pastDue = new Date(now.getTime() - 1000 * 60 * 60 * 24) // 1 day ago
  const futureDue = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7) // 1 week from now

  const samples = [
    {
      title: 'Review pull requests',
      description: 'Review pull requests for the project',
      dueDate: pastDue.toISOString(),
      completed: false,
      user: user.id,
    },
    {
      title: 'Write unit tests',
      description: 'Write unit tests for the project',
      dueDate: pastDue.toISOString(),
      completed: false,
      user: user.id,
    },
    {
      title: 'Deploy to staging',
      description: 'Deploy the project to staging',
      dueDate: now.toISOString(),
      completed: false,
      user: user.id,
    },
    {
      title: 'Update documentation',
      description: 'Update the documentation for the project',
      dueDate: futureDue.toISOString(),
      completed: false,
      user: user.id,
    },
    {
      title: 'Fix login bug',
      description: 'Fix the login bug for the project',
      dueDate: pastDue.toISOString(),
      completed: true,
      user: user.id,
    },
  ]

  for (const todo of samples) {
    await payload.create({ collection: 'todo', data: todo })
  }

  return { created: samples.length }
}
