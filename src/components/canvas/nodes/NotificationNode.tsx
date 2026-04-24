import { memo } from 'react'
import { type NodeProps } from 'reactflow'
import type { WorkflowNodeData } from '@/types/workflow'
import BaseNode from './BaseNode'

/** Custom React Flow renderer for Notification nodes — terminal node, no source handle. */
const NotificationNode = memo(function NotificationNode(props: NodeProps<WorkflowNodeData>) {
  return (
    <BaseNode
      {...props}
      icon="🔔"
      accentColor="#f43f5e"
      shape="rect"
      showTarget
      sourceHandles={[]}
    />
  )
})

export default NotificationNode
