import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  WorkflowNodeData,
  ValidationResult,
  SimulationResult,
  SimulationStep,
  NodeVersion,
} from '@/types/workflow'
import { NODE_REGISTRY } from '@/registry/nodeRegistry'

// ── State shape ────────────────────────────────────────────────────────────────

export interface WorkflowState {
  // Graph
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId: string | null

  // UI
  isValidationPanelOpen: boolean
  isSimulationPanelOpen: boolean
  isTemplateSelectorOpen: boolean
  toastMessage: string | null

  // Async
  validationResult: ValidationResult | null
  simulationResult: SimulationResult | null
  isSimulating: boolean
  simulationError: string | null

  // Workflow meta
  workflowName: string
  workflowId: string
}

// ── Action shape ───────────────────────────────────────────────────────────────

export interface WorkflowActions {
  // Node CRUD
  addNode: (type: NodeType, position: { x: number; y: number }) => string
  updateNodeData: (nodeId: string, patch: Partial<WorkflowNodeData>) => void
  removeNode: (nodeId: string) => void
  setNodePosition: (nodeId: string, position: { x: number; y: number }) => void

  // Edge CRUD
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => void
  removeEdge: (edgeId: string) => void

  // Selection
  setSelectedNodeId: (id: string | null) => void

  // Validation
  setValidationResult: (result: ValidationResult | null) => void
  setNodeValidationErrors: (nodeId: string, errors: string[]) => void
  clearAllValidationErrors: () => void

  // Simulation
  setSimulationResult: (result: SimulationResult | null) => void
  setSimulationStep: (nodeId: string, patch: Partial<SimulationStep>) => void
  setIsSimulating: (v: boolean) => void
  setSimulationError: (e: string | null) => void

  // UI toggles
  setValidationPanelOpen: (v: boolean) => void
  setSimulationPanelOpen: (v: boolean) => void
  setTemplateSelectorOpen: (v: boolean) => void
  showToast: (message: string) => void
  clearToast: () => void

  // Bulk ops
  loadWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[], name?: string) => void
  clearWorkflow: () => void

  // Meta
  setWorkflowName: (name: string) => void
  snapshotNodeVersion: (nodeId: string, description: string) => void
}

export type WorkflowStore = WorkflowState & WorkflowActions

// ── Initial state ──────────────────────────────────────────────────────────────

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isValidationPanelOpen: false,
  isSimulationPanelOpen: false,
  isTemplateSelectorOpen: false,
  toastMessage: null,
  validationResult: null,
  simulationResult: null,
  isSimulating: false,
  simulationError: null,
  workflowName: 'Untitled Workflow',
  workflowId: nanoid(),
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowStore>()(
  temporal(
    immer((set) => ({
      ...initialState,

      // ── Node CRUD ────────────────────────────────────────────────────────────

      /** Creates a new node from the registry defaults and returns its id. */
      addNode: (type, position) => {
        const id = nanoid()
        const entry = NODE_REGISTRY[type]
        const data = {
          ...entry.defaultData,
          type,
          validationErrors: [],
          versionHistory: [],
        } as unknown as WorkflowNodeData

        set((state) => {
          state.nodes.push({ id, type, position, data })
        })
        return id
      },

      /** Patches node data and records a version snapshot if label changes. */
      updateNodeData: (nodeId, patch) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId)
          if (!node) return
          Object.assign(node.data, patch)
        })
      },

      removeNode: (nodeId) => {
        set((state) => {
          state.nodes = state.nodes.filter((n) => n.id !== nodeId)
          state.edges = state.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          )
          if (state.selectedNodeId === nodeId) state.selectedNodeId = null
        })
      },

      setNodePosition: (nodeId, position) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId)
          if (node) node.position = position
        })
      },

      // ── Edge CRUD ────────────────────────────────────────────────────────────

      addEdge: (edge) => {
        set((state) => {
          const isDuplicate = state.edges.some(
            (e) =>
              e.source === edge.source &&
              e.target === edge.target &&
              e.sourceHandle === edge.sourceHandle,
          )
          if (!isDuplicate) {
            state.edges.push({ ...edge, id: nanoid() })
          }
        })
      },

      removeEdge: (edgeId) => {
        set((state) => {
          state.edges = state.edges.filter((e) => e.id !== edgeId)
        })
      },

      // ── Selection ────────────────────────────────────────────────────────────

      setSelectedNodeId: (id) => {
        set((state) => { state.selectedNodeId = id })
      },

      // ── Validation ───────────────────────────────────────────────────────────

      setValidationResult: (result) => {
        set((state) => { state.validationResult = result })
      },

      setNodeValidationErrors: (nodeId, errors) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId)
          if (node) node.data.validationErrors = errors
        })
      },

      clearAllValidationErrors: () => {
        set((state) => {
          state.nodes.forEach((n) => { n.data.validationErrors = [] })
          state.validationResult = null
        })
      },

      // ── Simulation ───────────────────────────────────────────────────────────

      setSimulationResult: (result) => {
        set((state) => { state.simulationResult = result })
      },

      setSimulationStep: (nodeId, patch) => {
        set((state) => {
          const step = state.simulationResult?.steps.find((s) => s.nodeId === nodeId)
          if (step) Object.assign(step, patch)
        })
      },

      setIsSimulating: (v) => {
        set((state) => { state.isSimulating = v })
      },

      setSimulationError: (e) => {
        set((state) => { state.simulationError = e })
      },

      // ── UI toggles ───────────────────────────────────────────────────────────

      setValidationPanelOpen: (v) => {
        set((state) => { state.isValidationPanelOpen = v })
      },

      setSimulationPanelOpen: (v) => {
        set((state) => { state.isSimulationPanelOpen = v })
      },

      setTemplateSelectorOpen: (v) => {
        set((state) => { state.isTemplateSelectorOpen = v })
      },

      showToast: (message) => {
        set((state) => { state.toastMessage = message })
      },

      clearToast: () => {
        set((state) => { state.toastMessage = null })
      },

      // ── Bulk ops ─────────────────────────────────────────────────────────────

      loadWorkflow: (nodes, edges, name) => {
        set((state) => {
          state.nodes = nodes
          state.edges = edges
          state.selectedNodeId = null
          state.validationResult = null
          state.simulationResult = null
          if (name) state.workflowName = name
        })
      },

      clearWorkflow: () => {
        set((state) => {
          state.nodes = []
          state.edges = []
          state.selectedNodeId = null
          state.validationResult = null
          state.simulationResult = null
          state.workflowId = nanoid()
        })
      },

      // ── Meta ─────────────────────────────────────────────────────────────────

      setWorkflowName: (name) => {
        set((state) => { state.workflowName = name })
      },

      /** Saves a snapshot of current node data into its version history. */
      snapshotNodeVersion: (nodeId, description) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId)
          if (!node) return
          const { versionHistory, validationErrors: _ve, ...rest } = node.data
          const snapshot: NodeVersion = {
            timestamp: new Date().toISOString(),
            description,
            data: rest as NodeVersion['data'],
          }
          versionHistory.push(snapshot)
        })
      },
    })),
    {
      limit: 50,
      // Exclude UI-only and async state from undo history
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        workflowName: state.workflowName,
      }),
    },
  ),
)
