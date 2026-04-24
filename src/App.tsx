import { ReactFlowProvider } from 'reactflow'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import Toast from '@/components/ui/Toast'
import WorkflowToolbar from '@/components/toolbar/WorkflowToolbar'
import NodeSidebar from '@/components/sidebar/NodeSidebar'
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas'
import NodeFormPanel from '@/components/forms/NodeFormPanel'
import ValidationPanel from '@/components/validation/ValidationPanel'
import SimulationTimeline from '@/components/simulation/SimulationTimeline'
import TemplateSelector from '@/components/templates/TemplateSelector'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useWorkflowStore } from '@/store/workflowStore'

/** Inner app with access to all hooks (must be inside ReactFlowProvider). */
function AppInner() {
  useKeyboardShortcuts()
  const isValidationPanelOpen = useWorkflowStore((s) => s.isValidationPanelOpen)
  const isSimulationPanelOpen = useWorkflowStore((s) => s.isSimulationPanelOpen)

  return (
    <div className="app-shell">
      <WorkflowToolbar />

      <div className="app-body">
        {/* Left: Node palette */}
        <NodeSidebar />

        {/* Centre: Canvas */}
        <main className="canvas-container" role="main" aria-label="Workflow canvas area">
          <ErrorBoundary>
            <WorkflowCanvas />
          </ErrorBoundary>
        </main>

        {/* Right: Form panel */}
        <NodeFormPanel />

        {/* Overlapping right panels */}
        {isValidationPanelOpen && (
          <div className="overlay-panel overlay-panel--right">
            <ValidationPanel />
          </div>
        )}
        {isSimulationPanelOpen && (
          <div className="overlay-panel overlay-panel--right">
            <SimulationTimeline />
          </div>
        )}
      </div>

      {/* Global overlays */}
      <TemplateSelector />
      <Toast />
    </div>
  )
}

/** Root application component. */
export default function App() {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <AppInner />
      </ReactFlowProvider>
    </ErrorBoundary>
  )
}
