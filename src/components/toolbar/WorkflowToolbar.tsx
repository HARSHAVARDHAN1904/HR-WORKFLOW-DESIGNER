import { useRef } from 'react'
import { useStore } from 'zustand'
import { useWorkflowStore } from '@/store/workflowStore'
import { validateGraph } from '@/schemas/graphValidation'
import { exportWorkflow, downloadJson, parseWorkflowJson, readFileAsText } from '@/utils/exportImport'
import { useSimulation } from '@/hooks/useSimulation'
import { useAutoLayout } from '@/hooks/useAutoLayout'

/** Top toolbar — validate, simulate, undo/redo, export, import, auto-layout, templates */
export default function WorkflowToolbar() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const workflowName = useWorkflowStore((s) => s.workflowName)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const setValidationResult = useWorkflowStore((s) => s.setValidationResult)
  const setNodeValidationErrors = useWorkflowStore((s) => s.setNodeValidationErrors)
  const clearAllValidationErrors = useWorkflowStore((s) => s.clearAllValidationErrors)
  const setValidationPanelOpen = useWorkflowStore((s) => s.setValidationPanelOpen)
  const setTemplateSelectorOpen = useWorkflowStore((s) => s.setTemplateSelectorOpen)
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow)
  const showToast = useWorkflowStore((s) => s.showToast)
  const clearWorkflow = useWorkflowStore((s) => s.clearWorkflow)

  const { undo, redo, futureStates, pastStates } = useStore(useWorkflowStore.temporal)
  const { simulate, isSimulating } = useSimulation()
  const applyLayout = useAutoLayout()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  /** Run all 8 validation rules and update store. */
  function handleValidate() {
    clearAllValidationErrors()
    const result = validateGraph(nodes, edges)
    setValidationResult(result)

    // Mark per-node errors
    for (const error of result.errors) {
      if (error.nodeId) {
        const existing = result.errors
          .filter((e) => e.nodeId === error.nodeId)
          .map((e) => e.message)
        setNodeValidationErrors(error.nodeId, existing)
      }
    }

    setValidationPanelOpen(true)
    showToast(
      result.valid
        ? 'Workflow is valid ✓'
        : `Found ${result.errors.length} issue${result.errors.length !== 1 ? 's' : ''}`,
    )
  }

  function handleExport() {
    const json = exportWorkflow(nodes, edges, workflowName)
    downloadJson(json, `${workflowName.replace(/\s+/g, '_')}.json`)
    showToast('Workflow exported ✓')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const result = parseWorkflowJson(text)
      if (!result.ok) {
        showToast(`Import failed: ${result.error}`)
        return
      }
      loadWorkflow(result.nodes, result.edges, result.name)
      showToast('Workflow imported ✓')
    } catch {
      showToast('Failed to read file.')
    }
    // reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <header className="workflow-toolbar" role="banner">
      {/* Workflow name */}
      <div className="toolbar-name">
        <input
          id="workflow-name-input"
          className="toolbar-name__input"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          aria-label="Workflow name"
          placeholder="Untitled Workflow"
        />
      </div>

      <div className="toolbar-actions">
        {/* Undo / Redo */}
        <button
          id="btn-undo"
          className="toolbar-btn toolbar-btn--icon"
          onClick={() => undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >↩</button>
        <button
          id="btn-redo"
          className="toolbar-btn toolbar-btn--icon"
          onClick={() => redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >↪</button>

        <div className="toolbar-divider" aria-hidden="true" />

        {/* Auto-layout */}
        <button
          id="btn-layout"
          className="toolbar-btn"
          onClick={() => applyLayout('TB')}
          title="Auto-layout (top-bottom)"
        >
          ⬡ Layout
        </button>

        {/* Templates */}
        <button
          id="btn-templates"
          className="toolbar-btn"
          onClick={() => setTemplateSelectorOpen(true)}
          title="Load a template"
        >
          📋 Templates
        </button>

        <div className="toolbar-divider" aria-hidden="true" />

        {/* Validate */}
        <button
          id="btn-validate"
          className="toolbar-btn toolbar-btn--validate"
          onClick={handleValidate}
          title="Validate workflow (8 rules)"
        >
          ✓ Validate
        </button>

        {/* Simulate */}
        <button
          id="btn-simulate"
          className="toolbar-btn toolbar-btn--simulate"
          onClick={() => void simulate()}
          disabled={isSimulating}
          title="Run simulation"
        >
          {isSimulating ? '⟳ Running…' : '▶ Simulate'}
        </button>

        <div className="toolbar-divider" aria-hidden="true" />

        {/* Export */}
        <button
          id="btn-export"
          className="toolbar-btn"
          onClick={handleExport}
          title="Export workflow as JSON"
        >
          ↑ Export
        </button>

        {/* Import */}
        <button
          id="btn-import"
          className="toolbar-btn"
          onClick={handleImportClick}
          title="Import workflow from JSON"
        >
          ↓ Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => void handleFileChange(e)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Clear */}
        <button
          id="btn-clear"
          className="toolbar-btn toolbar-btn--danger"
          onClick={clearWorkflow}
          title="Clear all nodes and edges"
        >
          ✕ Clear
        </button>
      </div>
    </header>
  )
}
