import { lazy, Suspense, useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { NODE_REGISTRY } from '@/registry/nodeRegistry'
import type { NodeType } from '@/types/workflow'
import type {
  TriggerData,
  ActionData,
  ConditionData,
  DelayData,
  NotificationData,
} from '@/types/workflow'

// Lazy-load per-node forms — not on the critical path
const TriggerForm = lazy(() => import('./fields/TriggerForm'))
const ActionForm = lazy(() => import('./fields/ActionForm'))
const ConditionForm = lazy(() => import('./fields/ConditionForm'))
const DelayForm = lazy(() => import('./fields/DelayForm'))
const NotificationForm = lazy(() => import('./fields/NotificationForm'))

// ── Version History sub-panel ─────────────────────────────────────────────────

function VersionHistory({ nodeId }: { nodeId: string }) {
  const nodes = useWorkflowStore((s) => s.nodes)
  const snapshotVersion = useWorkflowStore((s) => s.snapshotNodeVersion)
  const node = nodes.find((n) => n.id === nodeId)
  const history = node?.data.versionHistory ?? []

  return (
    <div className="version-history">
      <div className="version-history__header">
        <h4 className="version-history__title">Version History</h4>
        <button
          className="version-history__snapshot-btn"
          onClick={() => snapshotVersion(nodeId, 'Manual snapshot')}
          title="Save current version"
        >
          + Snapshot
        </button>
      </div>
      {history.length === 0 ? (
        <p className="version-history__empty">No versions yet. Click + Snapshot to save one.</p>
      ) : (
        <ul className="version-history__list">
          {[...history].reverse().map((v, idx) => (
            <li key={`${v.timestamp}-${idx}`} className="version-history__item">
              <span className="version-history__ts">
                {new Date(v.timestamp).toLocaleTimeString()}
              </span>
              <span className="version-history__desc">{v.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

/**
 * Right-side panel that renders the appropriate form for the selected node,
 * plus its validation errors and version history.
 */
export default function NodeFormPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const nodes = useWorkflowStore((s) => s.nodes)
  const removeNode = useWorkflowStore((s) => s.removeNode)
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId)
  const [activeTab, setActiveTab] = useState<'config' | 'history'>('config')

  if (!selectedNodeId) {
    return (
      <aside className="form-panel form-panel--empty" aria-label="Node properties">
        <div className="form-panel__placeholder">
          <span className="form-panel__placeholder-icon" aria-hidden="true">←</span>
          <p>Select a node to configure it</p>
        </div>
      </aside>
    )
  }

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const entry = NODE_REGISTRY[node.type as NodeType]

  function handleDelete() {
    removeNode(selectedNodeId!)
    setSelectedNodeId(null)
  }

  return (
    <aside className="form-panel" aria-label="Node properties">
      {/* Header */}
      <div className="form-panel__header" style={{ '--accent': entry.accentColor } as React.CSSProperties}>
        <div className="form-panel__title-row">
          <span className="form-panel__icon" aria-hidden="true">{entry.icon}</span>
          <div>
            <h3 className="form-panel__title">{entry.label}</h3>
            <span className="form-panel__node-id">id: {selectedNodeId.slice(0, 8)}…</span>
          </div>
        </div>
        <button
          id="btn-delete-node"
          className="form-panel__delete-btn"
          onClick={handleDelete}
          aria-label="Delete this node"
          title="Delete node (Del)"
        >
          🗑
        </button>
      </div>

      {/* Validation errors on node */}
      {node.data.validationErrors.length > 0 && (
        <div className="form-panel__errors" role="alert">
          {node.data.validationErrors.map((err, idx) => (
            <div key={idx} className="form-panel__error-item">✖ {err}</div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="form-panel__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'config'}
          className={`form-tab ${activeTab === 'config' ? 'form-tab--active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Config
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`form-tab ${activeTab === 'history' ? 'form-tab--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Tab content */}
      <div className="form-panel__body">
        {activeTab === 'config' && (
          <Suspense fallback={<div className="form-loading">Loading…</div>}>
            {node.type === 'trigger' && (
              <TriggerForm nodeId={selectedNodeId} data={node.data as TriggerData} />
            )}
            {node.type === 'action' && (
              <ActionForm nodeId={selectedNodeId} data={node.data as ActionData} />
            )}
            {node.type === 'condition' && (
              <ConditionForm nodeId={selectedNodeId} data={node.data as ConditionData} />
            )}
            {node.type === 'delay' && (
              <DelayForm nodeId={selectedNodeId} data={node.data as DelayData} />
            )}
            {node.type === 'notification' && (
              <NotificationForm nodeId={selectedNodeId} data={node.data as NotificationData} />
            )}
          </Suspense>
        )}

        {activeTab === 'history' && (
          <VersionHistory nodeId={selectedNodeId} />
        )}
      </div>
    </aside>
  )
}
