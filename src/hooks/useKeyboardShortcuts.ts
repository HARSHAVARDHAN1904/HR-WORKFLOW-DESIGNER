import { useEffect, useRef } from 'react'
import { useStore } from 'zustand'
import { useWorkflowStore } from '@/store/workflowStore'

/**
 * Registers global keyboard shortcuts.
 * Uses a ref to avoid stale closures — always reads the latest store state.
 */
export function useKeyboardShortcuts(): void {
  const store = useWorkflowStore()
  const { undo, redo } = useStore(useWorkflowStore.temporal)

  // Ref pattern: always points to the latest store slice
  const storeRef = useRef(store)
  useEffect(() => { storeRef.current = store }, [store])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey
      const current = storeRef.current

      // Ctrl+Z — undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl+Y or Ctrl+Shift+Z — redo
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl+S — show save toast (no backend)
      if (ctrl && e.key === 's') {
        e.preventDefault()
        current.showToast('Workflow saved to session ✓')
        return
      }

      // Delete / Backspace — remove selected node (if not in input)
      if ((e.key === 'Delete' || e.key === 'Backspace') &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        const { selectedNodeId, removeNode } = current
        if (selectedNodeId) {
          removeNode(selectedNodeId)
        }
        return
      }

      // Escape — deselect node
      if (e.key === 'Escape') {
        current.setSelectedNodeId(null)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])
}
