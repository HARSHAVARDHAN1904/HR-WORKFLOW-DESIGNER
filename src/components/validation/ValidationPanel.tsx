import { useWorkflowStore } from '@/store/workflowStore'
import type { ValidationError } from '@/types/workflow'
import { NODE_REGISTRY } from '@/registry/nodeRegistry'
import type { NodeType } from '@/types/workflow'

function ErrorRow({ error }: { error: ValidationError }) {
  const nodes = useWorkflowStore((s) => s.nodes)
  const node = error.nodeId ? nodes.find((n) => n.id === error.nodeId) : null

  return (
    <li className={`validation-error validation-error--${error.severity}`}>
      <span className="validation-error__icon" aria-hidden="true">
        {error.severity === 'error' ? '✖' : '⚠'}
      </span>
      <div className="validation-error__body">
        {node && (
          <span className="validation-error__node-badge" style={{
            '--accent': NODE_REGISTRY[node.type as NodeType]?.accentColor ?? '#64748b',
          } as React.CSSProperties}>
            {NODE_REGISTRY[node.type as NodeType]?.icon} {node.data.label}
          </span>
        )}
        <span className="validation-error__message">{error.message}</span>
        <span className="validation-error__rule">{error.rule}</span>
      </div>
    </li>
  )
}

/** Right / bottom panel showing validation errors from graphValidation.ts */
export default function ValidationPanel() {
  const isOpen = useWorkflowStore((s) => s.isValidationPanelOpen)
  const result = useWorkflowStore((s) => s.validationResult)
  const setOpen = useWorkflowStore((s) => s.setValidationPanelOpen)

  if (!isOpen) return null

  const errors = result?.errors ?? []
  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length

  return (
    <aside className="validation-panel" aria-label="Validation results" role="complementary">
      <div className="validation-panel__header">
        <h3 className="validation-panel__title">
          {result?.valid ? '✓ Workflow Valid' : '✖ Validation Issues'}
        </h3>
        <div className="validation-panel__badges">
          {errorCount > 0 && (
            <span className="badge badge--error">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
          )}
          {warningCount > 0 && (
            <span className="badge badge--warning">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
          )}
        </div>
        <button
          className="validation-panel__close"
          onClick={() => setOpen(false)}
          aria-label="Close validation panel"
        >✕</button>
      </div>

      {errors.length === 0 ? (
        <div className="validation-panel__empty">
          <span className="validation-panel__check">✓</span>
          <p>All rules passed. Your workflow is valid.</p>
        </div>
      ) : (
        <ul className="validation-panel__list" role="list">
          {errors.map((error, idx) => (
            <ErrorRow key={`${error.rule}-${error.nodeId ?? 'global'}-${idx}`} error={error} />
          ))}
        </ul>
      )}
    </aside>
  )
}
