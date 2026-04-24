import { memo } from 'react'
import { Position, type NodeProps } from 'reactflow'
import type { WorkflowNodeData } from '@/types/workflow'
import BaseNode from './BaseNode'

/** Custom React Flow renderer for Trigger nodes. */
const TriggerNode = memo(function TriggerNode(props: NodeProps<WorkflowNodeData>) {
  return (
    <BaseNode
      {...props}
      icon="⚡"
      accentColor="#22c55e"
      shape="circle"
      showTarget={false}
      sourceHandles={[{ id: 'source', position: Position.Bottom }]}
    />
  )
})

export default TriggerNode
