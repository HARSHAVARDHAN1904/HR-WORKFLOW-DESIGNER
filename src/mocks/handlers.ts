import { http, HttpResponse, delay } from 'msw'
import { nanoid } from 'nanoid'
import type { SimulationResult, SimulationStep } from '@/types/workflow'

// ── Seed data for GET /automations ────────────────────────────────────────────

const seedAutomations = [
  {
    id: 'auto-001',
    name: 'Daily Report Pipeline',
    description: 'Fetches data at 9 AM and emails a report.',
    status: 'active',
    createdAt: '2024-01-15T09:00:00Z',
    nodeCount: 4,
    lastRun: '2024-01-24T09:00:12Z',
  },
  {
    id: 'auto-002',
    name: 'Webhook → Slack Alert',
    description: 'Triggers on webhook; sends Slack notification on failure.',
    status: 'active',
    createdAt: '2024-01-10T14:30:00Z',
    nodeCount: 3,
    lastRun: '2024-01-23T18:45:01Z',
  },
  {
    id: 'auto-003',
    name: 'User Onboarding Flow',
    description: 'Schedules welcome email + 3-day follow-up after signup event.',
    status: 'draft',
    createdAt: '2024-01-20T11:00:00Z',
    nodeCount: 6,
    lastRun: null,
  },
]

// ── Handlers ──────────────────────────────────────────────────────────────────

export const handlers = [
  /**
   * GET /api/automations — returns seed list of saved automations.
   */
  http.get('/api/automations', async () => {
    await delay(250)
    return HttpResponse.json({
      data: seedAutomations,
      total: seedAutomations.length,
    })
  }),

  /**
   * POST /api/simulate — accepts a workflow payload, returns a mock execution timeline.
   */
  http.post('/api/simulate', async ({ request }) => {
    await delay(300)

    type SimulatePayload = {
      workflowId: string
      nodes: Array<{ id: string; type: string; data: { label: string } }>
    }

    const body = (await request.json()) as SimulatePayload
    const { workflowId, nodes } = body

    if (!nodes || nodes.length === 0) {
      return HttpResponse.json(
        { error: 'Workflow has no nodes to simulate.' },
        { status: 400 },
      )
    }

    const startedAt = new Date().toISOString()
    const steps: SimulationStep[] = nodes.map((node, idx) => {
      const offset = idx * 800
      const startMs = new Date(startedAt).getTime() + offset
      const endMs = startMs + Math.floor(Math.random() * 400 + 200)

      // Randomly fail ~10% of action nodes to make the simulation interesting
      const shouldFail = node.type === 'action' && Math.random() < 0.1

      return {
        nodeId: node.id,
        nodeLabel: node.data.label,
        nodeType: node.type as SimulationStep['nodeType'],
        status: shouldFail ? 'error' : 'success',
        startedAt: new Date(startMs).toISOString(),
        completedAt: new Date(endMs).toISOString(),
        output: shouldFail
          ? undefined
          : `Node "${node.data.label}" executed successfully.`,
        error: shouldFail
          ? `Simulated failure in "${node.data.label}": Connection timeout.`
          : undefined,
      }
    })

    const result: SimulationResult = {
      workflowId: workflowId ?? nanoid(),
      status: steps.some((s) => s.status === 'error') ? 'failed' : 'completed',
      steps,
      startedAt,
      completedAt: new Date(
        new Date(startedAt).getTime() + steps.length * 800 + 500,
      ).toISOString(),
    }

    return HttpResponse.json(result)
  }),

  /**
   * POST /api/automations — saves a workflow (returns the saved object).
   */
  http.post('/api/automations', async ({ request }) => {
    await delay(200)
    type SavePayload = { name: string; description?: string }
    const body = (await request.json()) as SavePayload
    return HttpResponse.json({
      id: nanoid(),
      name: body.name ?? 'Untitled',
      description: body.description ?? '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      lastRun: null,
    })
  }),
]
