import { memo } from 'react'
import { Position, type NodeProps } from 'reactflow'
import type { WorkflowNodeData } from '@/types/workflow'
import BaseNode from './BaseNode'

/** Custom React Flow renderer for Delay nodes. */
const DelayNode = memo(function DelayNode(props: NodeProps<WorkflowNodeData>) {
  return (
    <BaseNode
      {...props}
      icon="⏱"
      accentColor="#a855f7"
      shape="rect"
      showTarget
      sourceHandles={[{ id: 'source', position: Position.Bottom }]}
    />
  )
})

export default DelayNode
