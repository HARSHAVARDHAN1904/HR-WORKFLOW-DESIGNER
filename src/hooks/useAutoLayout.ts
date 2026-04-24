import { useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { computeDagreLayout } from '@/utils/dagreLayout'

/**
 * Returns a function that applies Dagre auto-layout to the current workflow.
 * Positions are written to the store via setNodePosition.
 */
export function useAutoLayout(): (direction?: 'TB' | 'LR') => void {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setNodePosition = useWorkflowStore((s) => s.setNodePosition)
  const showToast = useWorkflowStore((s) => s.showToast)

  return useCallback(
    (direction: 'TB' | 'LR' = 'TB') => {
      if (nodes.length === 0) {
        showToast('No nodes to layout.')
        return
      }
      const positions = computeDagreLayout(nodes, edges, direction)
      for (const { id, position } of positions) {
        setNodePosition(id, position)
      }
      showToast('Auto-layout applied ✓')
    },
    [nodes, edges, setNodePosition, showToast],
  )
}
