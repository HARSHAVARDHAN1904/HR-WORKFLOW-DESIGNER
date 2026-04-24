import dagre from 'dagre'
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow'

const NODE_WIDTH = 200
const NODE_HEIGHT = 80

/**
 * Runs the Dagre layout algorithm on the current nodes and edges.
 * Returns new node positions — does NOT mutate the store directly.
 */
export function computeDagreLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction: 'TB' | 'LR' = 'TB',
): Array<{ id: string; position: { x: number; y: number } }> {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const layout = g.node(node.id)
    return {
      id: node.id,
      position: {
        x: layout.x - NODE_WIDTH / 2,
        y: layout.y - NODE_HEIGHT / 2,
      },
    }
  })
}
