'use client'

import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  LoaderIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { toast } from 'sonner'
import { checkTasksDue, seedSampleTodos } from './actions'

type JobState = 'idle' | 'queued' | 'running' | 'completed' | 'error'

type JobRun = {
  id: string
  state: JobState
  dueCount?: number
  dueTitles?: string[]
  completedAt?: string | null
  error?: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function BackgroundJobsPage() {
  const [jobRuns, setJobRuns] = useState<JobRun[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const runJob = async () => {
    const runId = crypto.randomUUID()

    // Add to job runs as queued
    setJobRuns((prev) => [{ id: runId, state: 'queued' }, ...prev])
    setIsRunning(true)
    toast.info('Job queued — checking for due tasks...')

    try {
      // Keep the "queued" state visible for a short time
      await sleep(800)

      // Move to running
      setJobRuns((prev) => prev.map((r) => (r.id === runId ? { ...r, state: 'running' } : r)))

      const result = await checkTasksDue()

      // Keep the "running" state visible for a short time
      await sleep(800)

      setJobRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? {
                ...r,
                state: 'completed',
                dueCount: result.dueCount,
                dueTitles: result.dueTitles,
                completedAt: result.completedAt,
              }
            : r
        )
      )

      if (result.dueCount > 0) {
        toast.warning(`${result.dueCount} todo${result.dueCount === 1 ? '' : 's'} overdue`, {
          description: result.dueTitles.slice(0, 3).join(', '),
        })
      } else {
        toast.success("No overdue todos — you're all caught up!")
      }
    } catch (err) {
      // Brief pause so the failure transition is visible
      await sleep(400)

      setJobRuns((prev) =>
        prev.map((r) =>
          r.id === runId
            ? {
                ...r,
                state: 'error',
                error: err instanceof Error ? err.message : 'Unknown error',
              }
            : r
        )
      )
      toast.error('Job failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      const result = await seedSampleTodos()
      toast.success(`Created ${result.created} sample todos`)
    } catch (err) {
      toast.error('Failed to seed todos', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Main>
      <div className="container mx-auto max-w-3xl">
        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-1.5 text-muted-foreground"
          render={<Link href="/dashboard" />}
        >
          <ArrowLeftIcon className="size-4" />
          Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SettingsIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Background Jobs</h1>
              <p className="text-sm text-muted-foreground">
                Payload CMS job queue — queue, execute, and observe
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-mono text-primary">1.</span>
              Click the button to queue a{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">checkTasksDue</code> job
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-primary">2.</span>
              Payload runs the job — queries todos where{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">dueAt ≤ now</code> and{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">completed = false</code>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-primary">3.</span>
              Result returned — toast shows how many todos are overdue
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button onClick={runJob} disabled={isRunning}>
            {isRunning ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-4" />
                Run Check Tasks Due
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <PlusIcon className="size-4" />
                Seed Sample Todos
              </>
            )}
          </Button>
        </div>

        {/* Job runs log */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Job runs
          </h2>
          {jobRuns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No jobs run yet. Click the button above to queue one.
            </div>
          ) : (
            <div className="space-y-3">
              {jobRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="mt-0.5">
                    {run.state === 'queued' && (
                      <ClockIcon className="size-5 text-muted-foreground" />
                    )}
                    {run.state === 'running' && (
                      <LoaderIcon className="size-5 animate-spin text-primary" />
                    )}
                    {run.state === 'completed' && (
                      <CheckCircle2Icon className="size-5 text-green-500" />
                    )}
                    {run.state === 'error' && <span className="size-5 text-destructive">!</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">checkTasksDue</span>
                      <JobStateBadge state={run.state} />
                    </div>
                    {run.state === 'completed' && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {run.dueCount === 0
                          ? 'No overdue todos found'
                          : `${run.dueCount} overdue: ${run.dueTitles?.join(', ')}`}
                      </p>
                    )}
                    {run.state === 'error' && (
                      <p className="mt-1 text-sm text-destructive">{run.error}</p>
                    )}
                    <p className="mt-1 font-mono text-xs text-muted-foreground/60">
                      {run.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Main>
  )
}

function JobStateBadge({ state }: { state: JobState }) {
  switch (state) {
    case 'queued':
      return <Badge variant="outline">Queued</Badge>
    case 'running':
      return <Badge variant="secondary">Running</Badge>
    case 'completed':
      return <Badge variant="default">Completed</Badge>
    case 'error':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return null
  }
}
