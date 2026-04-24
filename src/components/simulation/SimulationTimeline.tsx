import { useWorkflowStore } from '@/store/workflowStore'
import type { SimulationStep } from '@/types/workflow'
import { NODE_REGISTRY } from '@/registry/nodeRegistry'
import type { NodeType } from '@/types/workflow'

const STATUS_ICON: Record<SimulationStep['status'], string> = {
  pending: '○',
  running: '⟳',
  success: '✓',
  error: '✖',
  skipped: '⊘',
}

const STATUS_COLOR: Record<SimulationStep['status'], string> = {
  pending: '#64748b',
  running: '#f59e0b',
  success: '#22c55e',
  error: '#ef4444',
  skipped: '#64748b',
}

function StepRow({ step }: { step: SimulationStep }) {
  const nodeEntry = NODE_REGISTRY[step.nodeType as NodeType]
  const duration =
    step.completedAt && step.startedAt
      ? Math.round(
          new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime(),
        )
      : null

  return (
    <li className="sim-step" aria-label={`${step.nodeLabel}: ${step.status}`}>
      <div
        className="sim-step__status-icon"
        style={{ color: STATUS_COLOR[step.status] }}
        aria-hidden="true"
      >
        {STATUS_ICON[step.status]}
      </div>

      <div className="sim-step__body">
        <div className="sim-step__node">
          <span className="sim-step__node-icon" aria-hidden="true">
            {nodeEntry?.icon ?? '⚙️'}
          </span>
          <span className="sim-step__node-label">{step.nodeLabel}</span>
          <span className="sim-step__node-type">{step.nodeType}</span>
        </div>

        {step.output && <p className="sim-step__output">{step.output}</p>}
        {step.error && <p className="sim-step__error">{step.error}</p>}

        {duration !== null && (
          <span className="sim-step__duration">{duration}ms</span>
        )}
      </div>
    </li>
  )
}

/** Simulation execution timeline panel */
export default function SimulationTimeline() {
  const isOpen = useWorkflowStore((s) => s.isSimulationPanelOpen)
  const result = useWorkflowStore((s) => s.simulationResult)
  const isSimulating = useWorkflowStore((s) => s.isSimulating)
  const error = useWorkflowStore((s) => s.simulationError)
  const setOpen = useWorkflowStore((s) => s.setSimulationPanelOpen)

  if (!isOpen) return null

  const totalMs =
    result?.completedAt && result.startedAt
      ? Math.round(
          new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime(),
        )
      : null

  return (
    <aside className="sim-panel" aria-label="Simulation timeline" role="complementary">
      <div className="sim-panel__header">
        <h3 className="sim-panel__title">
          {isSimulating ? '⟳ Simulating…' : '▶ Simulation Results'}
        </h3>
        {result && (
          <span className={`badge badge--${result.status === 'completed' ? 'success' : 'error'}`}>
            {result.status}
          </span>
        )}
        {totalMs !== null && (
          <span className="sim-panel__duration">{totalMs}ms total</span>
        )}
        <button
          className="sim-panel__close"
          onClick={() => setOpen(false)}
          aria-label="Close simulation panel"
        >✕</button>
      </div>

      {isSimulating && (
        <div className="sim-panel__loading" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Running workflow simulation…
        </div>
      )}

      {error && !isSimulating && (
        <div className="sim-panel__error" role="alert">
          <strong>Simulation error:</strong> {error}
        </div>
      )}

      {result && !isSimulating && (
        <ul className="sim-panel__steps" role="list">
          {result.steps.map((step) => (
            <StepRow key={step.nodeId} step={step} />
          ))}
        </ul>
      )}
    </aside>
  )
}
