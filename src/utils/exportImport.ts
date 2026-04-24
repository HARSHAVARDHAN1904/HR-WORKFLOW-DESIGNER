import type { WorkflowNode, WorkflowEdge, Workflow } from '@/types/workflow'
import { nanoid } from 'nanoid'

// ── Export ─────────────────────────────────────────────────────────────────────

/**
 * Serialises the current workflow to a JSON string for download.
 */
export function exportWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name: string,
): string {
  const workflow: Workflow = {
    id: nanoid(),
    name,
    description: '',
    nodes,
    edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return JSON.stringify(workflow, null, 2)
}

/**
 * Triggers a browser file download with the given JSON content.
 */
export function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

// ── Import ─────────────────────────────────────────────────────────────────────

export interface ImportResult {
  ok: boolean
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  name: string
  error?: string
}

/**
 * Parses a JSON string into a workflow.
 * Returns an ImportResult — never throws.
 */
export function parseWorkflowJson(raw: string): ImportResult {
  try {
    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as Workflow).nodes) ||
      !Array.isArray((parsed as Workflow).edges)
    ) {
      return { ok: false, nodes: [], edges: [], name: '', error: 'Invalid workflow JSON structure.' }
    }

    const workflow = parsed as Workflow
    return {
      ok: true,
      nodes: workflow.nodes,
      edges: workflow.edges,
      name: workflow.name ?? 'Imported Workflow',
    }
  } catch {
    return { ok: false, nodes: [], edges: [], name: '', error: 'Failed to parse JSON.' }
  }
}

/**
 * Reads a File object and resolves with its text content.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
