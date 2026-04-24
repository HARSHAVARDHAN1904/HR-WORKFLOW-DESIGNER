import type { ComponentType } from 'react'
import type { NodeProps } from 'reactflow'
import type {
  NodeType,
  WorkflowNodeData,
  TriggerData,
  ActionData,
  ConditionData,
  DelayData,
  NotificationData,
} from '@/types/workflow'

/** Entry shape for each registered node type */
export interface NodeRegistryEntry<T extends WorkflowNodeData = WorkflowNodeData> {
  /** Human-readable label shown in sidebar */
  label: string
  /** Emoji icon for sidebar palette */
  icon: string
  /** Tailwind-style CSS color token (used as className) */
  color: string
  /** Accent hex for the node border / glow */
  accentColor: string
  /** Default data when a new node of this type is created */
  defaultData: Omit<T, 'validationErrors' | 'versionHistory'>
  /** Description shown in palette tooltip */
  description: string
  /** Whether this node can be a graph source (has outgoing edges) */
  canBeSource: boolean
  /** Whether this node can be a graph target (has incoming edges) */
  canBeTarget: boolean
  /** Number of source handles (condition has 2: true/false) */
  sourceHandles: string[]
  /** Custom React Flow node renderer — injected from components layer */
  NodeComponent?: ComponentType<NodeProps>
}

const triggerDefaults: Omit<TriggerData, 'validationErrors' | 'versionHistory'> = {
  label: 'Trigger',
  triggerType: 'schedule',
  cronExpression: '0 9 * * 1',
  webhookUrl: '',
  eventName: '',
  description: '',
}

const actionDefaults: Omit<ActionData, 'validationErrors' | 'versionHistory'> = {
  label: 'Action',
  actionType: 'http',
  httpMethod: 'POST',
  httpUrl: '',
  emailTo: '',
  emailSubject: '',
  emailBody: '',
  dbQuery: '',
  transformScript: '',
  description: '',
}

const conditionDefaults: Omit<ConditionData, 'validationErrors' | 'versionHistory'> = {
  label: 'Condition',
  conditionType: 'comparison',
  expression: '',
  leftOperand: '',
  operator: '==',
  rightOperand: '',
  description: '',
}

const delayDefaults: Omit<DelayData, 'validationErrors' | 'versionHistory'> = {
  label: 'Delay',
  delayUnit: 'minutes',
  duration: 5,
  description: '',
}

const notificationDefaults: Omit<NotificationData, 'validationErrors' | 'versionHistory'> = {
  label: 'Notification',
  channel: 'slack',
  recipient: '',
  message: '',
  severity: 'info',
  description: '',
}

/**
 * NODE TYPE REGISTRY — the single source of truth for all node types.
 * Adding a 6th node type requires changes to THIS FILE ONLY
 * (plus a new entry in src/types/workflow.ts for the data shape).
 */
export const NODE_REGISTRY: Record<NodeType, NodeRegistryEntry> = {
  trigger: {
    label: 'Trigger',
    icon: '⚡',
    color: 'node-trigger',
    accentColor: '#22c55e',
    defaultData: triggerDefaults as WorkflowNodeData,
    description: 'Starts the workflow — schedule, webhook, or event.',
    canBeSource: true,
    canBeTarget: false,
    sourceHandles: ['source'],
  },
  action: {
    label: 'Action',
    icon: '⚙️',
    color: 'node-action',
    accentColor: '#3b82f6',
    defaultData: actionDefaults as WorkflowNodeData,
    description: 'Executes an operation — HTTP, email, DB, or transform.',
    canBeSource: true,
    canBeTarget: true,
    sourceHandles: ['source'],
  },
  condition: {
    label: 'Condition',
    icon: '◆',
    color: 'node-condition',
    accentColor: '#f59e0b',
    defaultData: conditionDefaults as WorkflowNodeData,
    description: 'Branches the flow — evaluates a boolean expression.',
    canBeSource: true,
    canBeTarget: true,
    sourceHandles: ['true', 'false'],
  },
  delay: {
    label: 'Delay',
    icon: '⏱',
    color: 'node-delay',
    accentColor: '#a855f7',
    defaultData: delayDefaults as WorkflowNodeData,
    description: 'Pauses execution for a fixed duration.',
    canBeSource: true,
    canBeTarget: true,
    sourceHandles: ['source'],
  },
  notification: {
    label: 'Notification',
    icon: '🔔',
    color: 'node-notification',
    accentColor: '#f43f5e',
    defaultData: notificationDefaults as WorkflowNodeData,
    description: 'Sends a message via Slack, email, SMS, or push.',
    canBeSource: false,
    canBeTarget: true,
    sourceHandles: [],
  },
}

/** Ordered list of node types for sidebar rendering */
export const NODE_TYPE_ORDER: NodeType[] = [
  'trigger',
  'action',
  'condition',
  'delay',
  'notification',
]
