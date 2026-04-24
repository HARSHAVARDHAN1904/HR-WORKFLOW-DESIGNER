import React, { useCallback, useMemo, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeMouseHandler,
  type OnConnect,
  BackgroundVariant,
  type Node,
  type Edge,
} from 'reactflow'
// @ts-ignore
import 'reactflow/dist/style.css'

import { useWorkflowStore } from '@/store/workflowStore'
import { NODE_REGISTRY } from '@/registry/nodeRegistry'
import type { NodeType, WorkflowNodeData } from '@/types/workflow'
import TriggerNode from './nodes/TriggerNode'
import ActionNode from './nodes/ActionNode'
import ConditionNode from './nodes/ConditionNode'
import DelayNode from './nodes/DelayNode'
import NotificationNode from './nodes/NotificationNode'

// ── React Flow node type map (must be stable — defined outside component) ─────
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  notification: NotificationNode,
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function storeNodesToFlow(storeNodes: ReturnType<typeof useWorkflowStore.getState>['nodes']): Node<WorkflowNodeData>[] {
  return storeNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  }))
}

function storeEdgesToFlow(storeEdges: ReturnType<typeof useWorkflowStore.getState>['edges']): Edge[] {
  return storeEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? null,
    targetHandle: e.targetHandle ?? null,
    label: e.label,
    animated: e.animated ?? false,
    style: { stroke: 'rgba(255,255,255,0.25)', strokeWidth: 2 },
    labelStyle: { fill: '#94a3b8', fontSize: 11 },
    labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
  }))
}

// ── Component ─────────────────────────────────────────────────────────────────

/** Main React Flow canvas. Syncs bidirectionally with the Zustand store. */
export default function WorkflowCanvas() {
  const storeNodes = useWorkflowStore((s) => s.nodes)
  const storeEdges = useWorkflowStore((s) => s.edges)
  const addNodeToStore = useWorkflowStore((s) => s.addNode)
  const addEdgeToStore = useWorkflowStore((s) => s.addEdge)
  const removeNode = useWorkflowStore((s) => s.removeNode)
  const removeEdge = useWorkflowStore((s) => s.removeEdge)
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId)
  const setNodePosition = useWorkflowStore((s) => s.setNodePosition)

  const [, , onNodesChange] = useNodesState(storeNodesToFlow(storeNodes))
  const [, , onEdgesChange] = useEdgesState(storeEdgesToFlow(storeEdges))

  // Sync store → React Flow
  const flowNodes = useMemo(() => storeNodesToFlow(storeNodes), [storeNodes])
  const flowEdges = useMemo(() => storeEdgesToFlow(storeEdges), [storeEdges])

  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // ── Drop handler ───────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!nodeType || !NODE_REGISTRY[nodeType]) return

      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!bounds) return

      addNodeToStore(nodeType, {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 40,
      })
    },
    [addNodeToStore],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // ── Connect handler ────────────────────────────────────────────────────────

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      addEdgeToStore({
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
        animated: false,
      })
    },
    [addEdgeToStore],
  )

  // ── Node click → select ────────────────────────────────────────────────────

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id)
    },
    [setSelectedNodeId],
  )

  // ── Deselect on pane click ─────────────────────────────────────────────────

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  // ── Node drag end → persist position ──────────────────────────────────────

  const onNodeDragStop: NodeMouseHandler = useCallback(
    (_event, node) => {
      setNodePosition(node.id, node.position)
    },
    [setNodePosition],
  )

  // ── Delete handlers ────────────────────────────────────────────────────────

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) removeNode(node.id)
    },
    [removeNode],
  )

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      for (const edge of deleted) removeEdge(edge.id)
    },
    [removeEdge],
  )

  return (
    <div
      ref={reactFlowWrapper}
      className="workflow-canvas"
      onDrop={onDrop}
      onDragOver={onDragOver}
      aria-label="Workflow canvas"
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Delete', 'Backspace']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls className="rf-controls" showInteractive={false} />
        <MiniMap
          className="rf-minimap"
          nodeColor={(node) => {
            const entry = NODE_REGISTRY[node.type as NodeType]
            return entry?.accentColor ?? '#64748b'
          }}
          maskColor="rgba(0,0,0,0.6)"
          style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </ReactFlow>

      {/* Empty state */}
      {storeNodes.length === 0 && (
        <div className="canvas-empty-state" aria-live="polite">
          <div className="canvas-empty-state__icon">🔧</div>
          <h2 className="canvas-empty-state__title">Start building your workflow</h2>
          <p className="canvas-empty-state__hint">
            Drag nodes from the sidebar, or pick a template from the toolbar.
          </p>
        </div>
      )}
    </div>
  )
}
