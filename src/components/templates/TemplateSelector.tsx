import { nanoid } from 'nanoid'
import { useWorkflowStore } from '@/store/workflowStore'
import type { WorkflowTemplate, WorkflowNode, WorkflowEdge } from '@/types/workflow'

// ── Template definitions ───────────────────────────────────────────────────────

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-daily-report',
    name: 'Daily Report Pipeline',
    description: 'Schedule → fetch data → email report',
    icon: '📊',
    nodes: [
      { type: 'trigger', position: { x: 250, y: 50 }, data: { type: 'trigger', label: 'Daily at 9AM', triggerType: 'schedule', cronExpression: '0 9 * * *', webhookUrl: '', eventName: '', description: 'Runs every weekday morning', validationErrors: [], versionHistory: [] } },
      { type: 'action', position: { x: 250, y: 180 }, data: { type: 'action', label: 'Fetch Report Data', actionType: 'http', httpMethod: 'GET', httpUrl: 'https://api.example.com/report', emailTo: '', emailSubject: '', emailBody: '', dbQuery: '', transformScript: '', description: '', validationErrors: [], versionHistory: [] } },
      { type: 'notification', position: { x: 250, y: 310 }, data: { type: 'notification', label: 'Email Report', channel: 'email', recipient: 'team@example.com', message: 'Your daily report is ready.', severity: 'info', description: '', validationErrors: [], versionHistory: [] } },
    ],
    edges: [
      { source: '__0', target: '__1', sourceHandle: 'source', targetHandle: 'target' },
      { source: '__1', target: '__2', sourceHandle: 'source', targetHandle: 'target' },
    ],
  },
  {
    id: 'tpl-webhook-alert',
    name: 'Webhook → Slack Alert',
    description: 'Webhook triggers conditional Slack notification',
    icon: '🔔',
    nodes: [
      { type: 'trigger', position: { x: 250, y: 50 }, data: { type: 'trigger', label: 'Webhook Trigger', triggerType: 'webhook', cronExpression: '', webhookUrl: 'https://hooks.example.com/payload', eventName: '', description: '', validationErrors: [], versionHistory: [] } },
      { type: 'condition', position: { x: 250, y: 180 }, data: { type: 'condition', label: 'Status Error?', conditionType: 'comparison', expression: '', leftOperand: 'status', operator: '==', rightOperand: 'error', description: '', validationErrors: [], versionHistory: [] } },
      { type: 'notification', position: { x: 100, y: 330 }, data: { type: 'notification', label: 'Slack Alert', channel: 'slack', recipient: '#alerts', message: 'An error occurred in the pipeline.', severity: 'error', description: '', validationErrors: [], versionHistory: [] } },
      { type: 'notification', position: { x: 400, y: 330 }, data: { type: 'notification', label: 'Log Success', channel: 'slack', recipient: '#general', message: 'Pipeline ran successfully.', severity: 'success', description: '', validationErrors: [], versionHistory: [] } },
    ],
    edges: [
      { source: '__0', target: '__1', sourceHandle: 'source', targetHandle: 'target' },
      { source: '__1', target: '__2', sourceHandle: 'true', targetHandle: 'target' },
      { source: '__1', target: '__3', sourceHandle: 'false', targetHandle: 'target' },
    ],
  },
  {
    id: 'tpl-user-onboarding',
    name: 'User Onboarding Flow',
    description: 'Event → delay → welcome email → follow-up',
    icon: '👋',
    nodes: [
      { type: 'trigger', position: { x: 250, y: 50 }, data: { type: 'trigger', label: 'User Signup', triggerType: 'event', cronExpression: '', webhookUrl: '', eventName: 'user.signup', description: '', validationErrors: [], versionHistory: [] } },
      { type: 'action', position: { x: 250, y: 180 }, data: { type: 'action', label: 'Send Welcome Email', actionType: 'email', httpMethod: 'POST', httpUrl: '', emailTo: '{{user.email}}', emailSubject: 'Welcome aboard!', emailBody: 'Hi {{user.name}}, welcome to our platform.', dbQuery: '', transformScript: '', description: '', validationErrors: [], versionHistory: [] } },
      { type: 'delay', position: { x: 250, y: 310 }, data: { type: 'delay', label: 'Wait 3 Days', delayUnit: 'days', duration: 3, description: '', validationErrors: [], versionHistory: [] } },
      { type: 'notification', position: { x: 250, y: 440 }, data: { type: 'notification', label: 'Follow-up Notification', channel: 'email', recipient: '{{user.email}}', message: 'Check out these features you might have missed!', severity: 'info', description: '', validationErrors: [], versionHistory: [] } },
    ],
    edges: [
      { source: '__0', target: '__1', sourceHandle: 'source', targetHandle: 'target' },
      { source: '__1', target: '__2', sourceHandle: 'source', targetHandle: 'target' },
      { source: '__2', target: '__3', sourceHandle: 'source', targetHandle: 'target' },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: WorkflowTemplate
  onSelect: (t: WorkflowTemplate) => void
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <button
      className="template-card"
      onClick={() => onSelect(template)}
      aria-label={`Load template: ${template.name}`}
    >
      <span className="template-card__icon" aria-hidden="true">{template.icon}</span>
      <div className="template-card__body">
        <h4 className="template-card__name">{template.name}</h4>
        <p className="template-card__desc">{template.description}</p>
        <span className="template-card__meta">
          {template.nodes.length} nodes · {template.edges.length} edges
        </span>
      </div>
      <span className="template-card__arrow" aria-hidden="true">→</span>
    </button>
  )
}

/** Modal overlay for selecting a workflow template. */
export default function TemplateSelector() {
  const isOpen = useWorkflowStore((s) => s.isTemplateSelectorOpen)
  const setOpen = useWorkflowStore((s) => s.setTemplateSelectorOpen)
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow)
  const showToast = useWorkflowStore((s) => s.showToast)

  if (!isOpen) return null

  function handleSelect(template: WorkflowTemplate) {
    // Re-assign real IDs to avoid collisions
    const idMap = new Map<string, string>()
    template.nodes.forEach((_, idx) => {
      idMap.set(`__${idx}`, nanoid())
    })

    const nodes: WorkflowNode[] = template.nodes.map((n, idx) => ({
      ...n,
      id: idMap.get(`__${idx}`) ?? nanoid(),
    }))

    const edges: WorkflowEdge[] = template.edges.map((e) => ({
      ...e,
      id: nanoid(),
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
      animated: false,
      label: undefined,
    }))

    loadWorkflow(nodes, edges, template.name)
    setOpen(false)
    showToast(`Template "${template.name}" loaded ✓`)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Template selector">
      <div className="modal-box">
        <div className="modal-box__header">
          <h2 className="modal-box__title">📋 Choose a Template</h2>
          <button
            className="modal-box__close"
            onClick={() => setOpen(false)}
            aria-label="Close template selector"
          >✕</button>
        </div>
        <p className="modal-box__subtitle">
          Start from a pre-built workflow. You can customise it afterwards.
        </p>
        <div className="template-list" role="list">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}
