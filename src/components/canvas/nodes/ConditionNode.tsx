import { memo } from 'react'
import { Position, type NodeProps } from 'reactflow'
import type { WorkflowNodeData } from '@/types/workflow'
import BaseNode from './BaseNode'

/** Custom React Flow renderer for Condition nodes — diamond shape, two source handles. */
const ConditionNode = memo(function ConditionNode(props: NodeProps<WorkflowNodeData>) {
  return (
    <BaseNode
      {...props}
      icon="◆"
      accentColor="#f59e0b"
      shape="diamond"
      showTarget
      sourceHandles={[
        { id: 'true', position: Position.Bottom, label: 'T' },
        { id: 'false', position: Position.Bottom, label: 'F' },
      ]}
    />
  )
})

export default ConditionNode
