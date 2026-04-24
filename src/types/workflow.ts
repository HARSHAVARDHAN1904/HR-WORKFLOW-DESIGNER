// ============================================================
// Discriminated union types for the workflow graph
// ============================================================

/** All supported node type identifiers. Add new types here first. */
export type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'notification'

// ---------- per-node data shapes ----------

export interface TriggerData {
  label: string
  triggerType: 'schedule' | 'webhook' | 'manual' | 'event'
  cronExpression: string
  webhookUrl: string
  eventName: string
  description: string
  validationErrors: string[]
  versionHistory: NodeVersion[]
}

export interface ActionData {
  label: string
  actionType: 'http' | 'email' | 'database' | 'transform'
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  httpUrl: string
  emailTo: string
  emailSubject: string
  emailBody: string
  dbQuery: string
  transformScript: string
  description: string
  validationErrors: string[]
  versionHistory: NodeVersion[]
}

export interface ConditionData {
  label: string
  conditionType: 'expression' | 'comparison' | 'exists'
  expression: string
  leftOperand: string
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith'
  rightOperand: string
  description: string
  validationErrors: string[]
  versionHistory: NodeVersion[]
}

export interface DelayData {
  label: string
  delayUnit: 'seconds' | 'minutes' | 'hours' | 'days'
  duration: number
  description: string
  validationErrors: string[]
  versionHistory: NodeVersion[]
}

export interface NotificationData {
  label: string
  channel: 'slack' | 'email' | 'sms' | 'push'
  recipient: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  description: string
  validationErrors: string[]
  versionHistory: NodeVersion[]
}

/** Discriminated union — the canonical node data type */
export type WorkflowNodeData =
  | ({ type: 'trigger' } & TriggerData)
  | ({ type: 'action' } & ActionData)
  | ({ type: 'condition' } & ConditionData)
  | ({ type: 'delay' } & DelayData)
  | ({ type: 'notification' } & NotificationData)

/** A node version snapshot for history tracking */
export interface NodeVersion {
  timestamp: string
  description: string
  data: Omit<WorkflowNodeData, 'versionHistory' | 'validationErrors'>
}

// ---------- graph-level types ----------

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle: string | null
  targetHandle: string | null
  label?: string
  animated?: boolean
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: WorkflowNodeData
}

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string
  updatedAt: string
}

// ---------- validation ----------

export interface ValidationError {
  nodeId?: string
  edgeId?: string
  rule: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// ---------- simulation ----------

export interface SimulationStep {
  nodeId: string
  nodeLabel: string
  nodeType: NodeType
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped'
  startedAt: string
  completedAt?: string
  output?: string
  error?: string
}

export interface SimulationResult {
  workflowId: string
  status: 'running' | 'completed' | 'failed'
  steps: SimulationStep[]
  startedAt: string
  completedAt?: string
}

// ---------- templates ----------

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: string
  nodes: Omit<WorkflowNode, 'id'>[]
  edges: Omit<WorkflowEdge, 'id'>[]
}
