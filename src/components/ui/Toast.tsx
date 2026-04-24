import { useEffect } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'

/** Global toast notification — auto-dismisses after 3 seconds. */
export default function Toast() {
  const message = useWorkflowStore((s) => s.toastMessage)
  const clearToast = useWorkflowStore((s) => s.clearToast)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(clearToast, 3000)
    return () => clearTimeout(timer)
  }, [message, clearToast])

  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite" aria-atomic="true">
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={clearToast} aria-label="Dismiss notification">✕</button>
    </div>
  )
}
