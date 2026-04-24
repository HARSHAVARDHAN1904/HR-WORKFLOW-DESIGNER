import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWorkflowStore } from '@/store/workflowStore'
import { triggerSchema, type TriggerFormValues } from '@/schemas/nodeSchemas'
import type { TriggerData } from '@/types/workflow'
import { FormField } from './FormField'

interface TriggerFormProps {
  nodeId: string
  data: TriggerData
}

/** Fully-controlled form for Trigger nodes. Every keystroke syncs to the store. */
export default function TriggerForm({ nodeId, data }: TriggerFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<TriggerFormValues>({
    resolver: zodResolver(triggerSchema),
    mode: 'onChange',
    defaultValues: {
      label: data.label,
      triggerType: data.triggerType,
      cronExpression: data.cronExpression,
      webhookUrl: data.webhookUrl,
      eventName: data.eventName,
      description: data.description,
    },
  })

  // Reset form when a different node is selected
  useEffect(() => {
    reset({
      label: data.label,
      triggerType: data.triggerType,
      cronExpression: data.cronExpression,
      webhookUrl: data.webhookUrl,
      eventName: data.eventName,
      description: data.description,
    })
  }, [nodeId, reset, data.label, data.triggerType, data.cronExpression, data.webhookUrl, data.eventName, data.description])

  // Sync every field change → store
  useEffect(() => {
    const subscription = watch((values) => {
      updateNodeData(nodeId, values as Partial<TriggerData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateNodeData, nodeId])

  const triggerType = watch('triggerType')

  return (
    <form className="node-form" aria-label="Trigger node configuration" noValidate>
      <FormField label="Label" error={errors.label?.message} required>
        <input id="trigger-label" className="form-input" {...register('label')} placeholder="Trigger name" />
      </FormField>

      <FormField label="Trigger Type" error={errors.triggerType?.message} required>
        <select id="trigger-type" className="form-select" {...register('triggerType')}>
          <option value="schedule">⏰ Schedule (cron)</option>
          <option value="webhook">🌐 Webhook</option>
          <option value="manual">👆 Manual</option>
          <option value="event">📡 Event</option>
        </select>
      </FormField>

      {triggerType === 'schedule' && (
        <FormField label="Cron Expression" error={errors.cronExpression?.message} required>
          <input
            id="trigger-cron"
            className="form-input form-input--mono"
            {...register('cronExpression')}
            placeholder="0 9 * * 1-5"
          />
          <span className="form-hint">Min Hour Day Month Weekday</span>
        </FormField>
      )}

      {triggerType === 'webhook' && (
        <FormField label="Webhook URL" error={errors.webhookUrl?.message} required>
          <input
            id="trigger-webhook"
            className="form-input"
            {...register('webhookUrl')}
            placeholder="https://hooks.example.com/…"
            type="url"
          />
        </FormField>
      )}

      {triggerType === 'event' && (
        <FormField label="Event Name" error={errors.eventName?.message} required>
          <input
            id="trigger-event"
            className="form-input"
            {...register('eventName')}
            placeholder="user.signup"
          />
        </FormField>
      )}

      <FormField label="Description" error={undefined}>
        <textarea
          id="trigger-description"
          className="form-textarea"
          {...register('description')}
          placeholder="Optional description…"
          rows={2}
        />
      </FormField>
    </form>
  )
}
