import { useCallback } from 'react'
import { NODE_REGISTRY, NODE_TYPE_ORDER } from '@/registry/nodeRegistry'
import type { NodeType } from '@/types/workflow'

/** Single draggable palette item in the sidebar. */
function NodePaletteItem({ type }: { type: NodeType }) {
  const entry = NODE_REGISTRY[type]

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData('application/reactflow', type)
      event.dataTransfer.effectAllowed = 'move'
    },
    [type],
  )

  return (
    <div
      className="palette-item"
      draggable
      onDragStart={onDragStart}
      role="button"
      tabIndex={0}
      aria-label={`Drag to add ${entry.label} node`}
      title={entry.description}
      style={{ '--accent': entry.accentColor } as React.CSSProperties}
    >
      <span className="palette-item__icon" aria-hidden="true">{entry.icon}</span>
      <div className="palette-item__info">
        <span className="palette-item__label">{entry.label}</span>
        <span className="palette-item__desc">{entry.description}</span>
      </div>
      <span className="palette-item__drag-hint" aria-hidden="true">⠿</span>
    </div>
  )
}

/** Left sidebar containing the draggable node palette. */
export default function NodeSidebar() {
  return (
    <aside className="node-sidebar" aria-label="Node palette">
      <div className="node-sidebar__header">
        <h2 className="node-sidebar__title">Nodes</h2>
        <p className="node-sidebar__subtitle">Drag onto canvas</p>
      </div>

      <div className="node-sidebar__list" role="list">
        {NODE_TYPE_ORDER.map((type) => (
          <NodePaletteItem key={type} type={type} />
        ))}
      </div>

      <div className="node-sidebar__footer">
        <p className="node-sidebar__tip">
          💡 Connect nodes by dragging from a handle to another node.
        </p>
      </div>
    </aside>
  )
}
