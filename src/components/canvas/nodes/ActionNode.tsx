import { memo } from 'react'
import { Position, type NodeProps } from 'reactflow'
import type { WorkflowNodeData } from '@/types/workflow'
import BaseNode from './BaseNode'

/** Custom React Flow renderer for Action nodes. */
const ActionNode = memo(function ActionNode(props: NodeProps<WorkflowNodeData>) {
  return (
    <BaseNode
      {...props}
      icon="⚙️"
      accentColor="#3b82f6"
      shape="rect"
      showTarget
      sourceHandles={[{ id: 'source', position: Position.Bottom }]}
    />
  )
})

export default ActionNode
