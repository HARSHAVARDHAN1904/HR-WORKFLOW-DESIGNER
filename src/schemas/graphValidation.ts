import type { WorkflowNode, WorkflowEdge, ValidationResult, ValidationError } from '@/types/workflow'
import { actionSchema, conditionSchema, delaySchema, notificationSchema, triggerSchema } from './nodeSchemas'

// ── Helper: DFS cycle detection ────────────────────────────────────────────────

/**
 * Returns true if the directed graph described by adjacency list has a cycle.
 * Uses iterative DFS with a recursion-stack set.
 */
function hasCycle(adjList: Map<string, string[]>, nodes: string[]): boolean {
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recStack.add(nodeId)
    const neighbors = adjList.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recStack.has(neighbor)) {
        return true
      }
    }
    recStack.delete(nodeId)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true
    }
  }
  return false
}

// ── Main validation function ───────────────────────────────────────────────────

/**
 * Runs all 8 graph validation rules against the current nodes + edges.
 * Returns a ValidationResult with all errors found.
 */
export function validateGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): ValidationResult {
  const errors: ValidationError[] = []

  // Build adjacency structures
  const adjList = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  const outDegree = new Map<string, number>()

  for (const node of nodes) {
    adjList.set(node.id, [])
    inDegree.set(node.id, 0)
    outDegree.set(node.id, 0)
  }

  for (const edge of edges) {
    adjList.get(edge.source)?.push(edge.target)
    outDegree.set(edge.source, (outDegree.get(edge.source) ?? 0) + 1)
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  }

  // ── Rule 1: At least one trigger node ─────────────────────────────────────
  const triggerNodes = nodes.filter((n) => n.type === 'trigger')
  if (triggerNodes.length === 0) {
    errors.push({
      rule: 'MISSING_TRIGGER',
      message: 'Workflow must have at least one Trigger node.',
      severity: 'error',
    })
  }

  // ── Rule 2: At least one terminal (notification) node ─────────────────────
  const notificationNodes = nodes.filter((n) => n.type === 'notification')
  if (notificationNodes.length === 0 && nodes.length > 0) {
    errors.push({
      rule: 'MISSING_TERMINAL',
      message: 'Workflow should have at least one Notification node as a terminal.',
      severity: 'warning',
    })
  }

  // ── Rule 3: No isolated nodes ─────────────────────────────────────────────
  for (const node of nodes) {
    const hasIn = (inDegree.get(node.id) ?? 0) > 0
    const hasOut = (outDegree.get(node.id) ?? 0) > 0
    const isIsolated = !hasIn && !hasOut
    // Triggers legitimately have no incoming; notifications have no outgoing
    const isLegitimate =
      (node.type === 'trigger' && !hasIn && hasOut) ||
      (node.type === 'notification' && hasIn && !hasOut)
    if (isIsolated || (!hasIn && !hasOut)) {
      if (node.type !== 'trigger' || !hasOut) {
        if (!isLegitimate) {
          errors.push({
            nodeId: node.id,
            rule: 'ISOLATED_NODE',
            message: `Node "${node.data.label}" is not connected to the workflow.`,
            severity: 'error',
          })
        }
      }
    }
  }

  // ── Rule 4: No cycles ─────────────────────────────────────────────────────
  const nodeIds = nodes.map((n) => n.id)
  if (hasCycle(adjList, nodeIds)) {
    errors.push({
      rule: 'CYCLE_DETECTED',
      message: 'The workflow contains a cycle. Workflows must be directed acyclic graphs.',
      severity: 'error',
    })
  }

  // ── Rule 5: Condition nodes must have exactly 2 outgoing edges ────────────
  for (const node of nodes.filter((n) => n.type === 'condition')) {
    const out = outDegree.get(node.id) ?? 0
    if (out !== 2) {
      errors.push({
        nodeId: node.id,
        rule: 'CONDITION_EDGE_COUNT',
        message: `Condition node "${node.data.label}" must have exactly 2 outgoing edges (true/false). Currently has ${out}.`,
        severity: 'error',
      })
    }
  }

  // ── Rule 6: No duplicate edges ────────────────────────────────────────────
  const edgeKeys = new Set<string>()
  for (const edge of edges) {
    const key = `${edge.source}→${edge.target}→${edge.sourceHandle ?? ''}`
    if (edgeKeys.has(key)) {
      errors.push({
        edgeId: edge.id,
        rule: 'DUPLICATE_EDGE',
        message: 'Duplicate edge detected between the same source handle and target.',
        severity: 'error',
      })
    }
    edgeKeys.add(key)
  }

  // ── Rule 7: Action nodes — required params filled ─────────────────────────
  for (const node of nodes.filter((n) => n.type === 'action')) {
    const result = actionSchema.safeParse(node.data)
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message).join(', ')
      errors.push({
        nodeId: node.id,
        rule: 'ACTION_MISSING_PARAMS',
        message: `Action node "${node.data.label}": ${msgs}`,
        severity: 'error',
      })
    }
  }

  // ── Rule 7b: Validate all node types via their schemas ────────────────────
  const schemaMap = {
    trigger: triggerSchema,
    condition: conditionSchema,
    delay: delaySchema,
    notification: notificationSchema,
  } as const

  for (const [type, schema] of Object.entries(schemaMap) as Array<
    [keyof typeof schemaMap, (typeof schemaMap)[keyof typeof schemaMap]]
  >) {
    for (const node of nodes.filter((n) => n.type === type)) {
      const result = schema.safeParse(node.data)
      if (!result.success) {
        const msgs = result.error.issues.map((i) => i.message).join(', ')
        errors.push({
          nodeId: node.id,
          rule: 'NODE_VALIDATION_FAILED',
          message: `${node.data.label}: ${msgs}`,
          severity: 'error',
        })
      }
    }
  }

  // ── Rule 8: Delay duration > 0 ────────────────────────────────────────────
  for (const node of nodes.filter((n) => n.type === 'delay')) {
    const result = delaySchema.safeParse(node.data)
    if (!result.success) {
      const durationIssue = result.error.issues.find((i) => i.path.includes('duration'))
      if (durationIssue) {
        errors.push({
          nodeId: node.id,
          rule: 'INVALID_DELAY_DURATION',
          message: `Delay node "${node.data.label}": ${durationIssue.message}`,
          severity: 'error',
        })
      }
    }
  }

  return {
    valid: errors.every((e) => e.severity !== 'error'),
    errors,
  }
}

/**
 * Groups validation errors by nodeId for O(1) lookup in canvas components.
 */
export function groupErrorsByNode(
  errors: ValidationError[],
): Map<string, ValidationError[]> {
  const map = new Map<string, ValidationError[]>()
  for (const error of errors) {
    if (error.nodeId) {
      const existing = map.get(error.nodeId) ?? []
      existing.push(error)
      map.set(error.nodeId, existing)
    }
  }
  return map
}
