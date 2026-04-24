import { useCallback, useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import type { SimulationResult } from '@/types/workflow'

interface UseSimulationReturn {
  simulate: () => Promise<void>
  isSimulating: boolean
  error: string | null
}

/**
 * Handles POST /api/simulate — reads nodes from store, fires the request,
 * and writes the result back to the store simulation state.
 */
export function useSimulation(): UseSimulationReturn {
  const nodes = useWorkflowStore((s) => s.nodes)
  const workflowId = useWorkflowStore((s) => s.workflowId)
  const setSimulationResult = useWorkflowStore((s) => s.setSimulationResult)
  const setIsSimulating = useWorkflowStore((s) => s.setIsSimulating)
  const setSimulationError = useWorkflowStore((s) => s.setSimulationError)
  const setSimulationPanelOpen = useWorkflowStore((s) => s.setSimulationPanelOpen)
  const showToast = useWorkflowStore((s) => s.showToast)

  const [isSimulating, setLocalSimulating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const simulate = useCallback(async () => {
    if (nodes.length === 0) {
      showToast('Add nodes to the canvas before simulating.')
      return
    }

    setLocalSimulating(true)
    setIsSimulating(true)
    setError(null)
    setSimulationError(null)
    setSimulationPanelOpen(true)

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: { label: n.data.label } })),
        }),
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }

      const result = (await response.json()) as SimulationResult
      setSimulationResult(result)
      showToast(`Simulation ${result.status === 'completed' ? 'completed ✓' : 'finished with errors'}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setSimulationError(message)
      showToast(`Simulation failed: ${message}`)
    } finally {
      setLocalSimulating(false)
      setIsSimulating(false)
    }
  }, [nodes, workflowId, setSimulationResult, setIsSimulating, setSimulationError, setSimulationPanelOpen, showToast])

  return { simulate, isSimulating, error }
}
