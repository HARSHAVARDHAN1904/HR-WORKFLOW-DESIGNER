import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { WorkflowNodeData } from '@/types/workflow'
import { useWorkflowStore } from '@/store/workflowStore'

interface BaseNodeProps extends NodeProps<WorkflowNodeData> {
  icon: string
  accentColor: string
  shape?: 'rect' | 'circle' | 'diamond'
  sourceHandles?: Array<{ id: string; label?: string; position: Position }>
  showTarget?: boolean
}

/** Shared node shell — renders the chrome (border, icon, label, validation dot) */
const BaseNode = memo(function BaseNode({
  id,
  data,
  selected,
  icon,
  accentColor,
  shape = 'rect',
  sourceHandles = [{ id: 'source', position: Position.Bottom }],
  showTarget = true,
}: BaseNodeProps) {
  const validationErrors = data.validationErrors ?? []
  const hasError = validationErrors.length > 0
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const isSelected = selected || selectedNodeId === id

  const borderColor = hasError
    ? '#ef4444'
    : isSelected
    ? accentColor
    : 'rgba(255,255,255,0.12)'

  const containerStyle: React.CSSProperties = {
    borderColor,
    boxShadow: isSelected
      ? `0 0 0 2px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.4)`
      : hasError
      ? '0 0 0 2px #ef444440'
      : '0 4px 16px rgba(0,0,0,0.3)',
    transform: shape === 'diamond' ? 'rotate(45deg)' : undefined,
  }

  const innerStyle: React.CSSProperties =
    shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}

  return (
    <div
      className={`workflow-node workflow-node--${shape}`}
      style={containerStyle}
      role="button"
      aria-label={`${data.type} node: ${data.label}`}
      aria-selected={isSelected}
    >
      {/* Target handle */}
      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          className="workflow-handle workflow-handle--target"
        />
      )}

      <div className="workflow-node__inner" style={innerStyle}>
        {/* Header */}
        <div className="workflow-node__header" style={{ color: accentColor }}>
          <span className="workflow-node__icon" aria-hidden="true">{icon}</span>
          <span className="workflow-node__type">{data.type?.toUpperCase()}</span>
          {hasError && (
            <span className="workflow-node__error-dot" title={validationErrors.join(', ')} aria-label="Validation error">
              ●
            </span>
          )}
        </div>

        {/* Label */}
        <div className="workflow-node__label">{data.label}</div>

        {/* Description snippet */}
        {data.description && (
          <div className="workflow-node__description">{data.description}</div>
        )}
      </div>

      {/* Source handles */}
      {sourceHandles.map((h) => (
        <Handle
          key={h.id}
          type="source"
          position={h.position}
          id={h.id}
          className="workflow-handle workflow-handle--source"
          style={
            sourceHandles.length === 2 && h.id === 'true'
              ? { left: '25%' }
              : sourceHandles.length === 2 && h.id === 'false'
              ? { left: '75%' }
              : undefined
          }
        >
          {h.label && (
            <span className="workflow-handle__label">{h.label}</span>
          )}
        </Handle>
      ))}
    </div>
  )
})

export default BaseNode
