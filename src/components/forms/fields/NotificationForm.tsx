import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWorkflowStore } from '@/store/workflowStore'
import { notificationSchema, type NotificationFormValues } from '@/schemas/nodeSchemas'
import type { NotificationData } from '@/types/workflow'
import { FormField } from './FormField'

interface NotificationFormProps {
  nodeId: string
  data: NotificationData
}

/** Fully-controlled form for Notification nodes. */
export default function NotificationForm({ nodeId, data }: NotificationFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  const { register, watch, reset, formState: { errors } } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    mode: 'onChange',
    defaultValues: {
      label: data.label,
      channel: data.channel,
      recipient: data.recipient,
      message: data.message,
      severity: data.severity,
      description: data.description,
    },
  })

  useEffect(() => {
    reset({
      label: data.label,
      channel: data.channel,
      recipient: data.recipient,
      message: data.message,
      severity: data.severity,
      description: data.description,
    })
  }, [nodeId, reset, data.label, data.channel, data.recipient, data.message, data.severity, data.description])

  useEffect(() => {
    const subscription = watch((values) => {
      updateNodeData(nodeId, values as Partial<NotificationData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateNodeData, nodeId])

  const channel = watch('channel')

  const channelPlaceholders: Record<string, string> = {
    slack: '#channel or @username',
    email: 'recipient@example.com',
    sms: '+1 555 000 0000',
    push: 'user-id or segment',
  }

  return (
    <form className="node-form" aria-label="Notification node configuration" noValidate>
      <FormField label="Label" error={errors.label?.message} required>
        <input id="notif-label" className="form-input" {...register('label')} placeholder="Notification name" />
      </FormField>

      <div className="form-row-2">
        <FormField label="Channel" error={errors.channel?.message} required>
          <select id="notif-channel" className="form-select" {...register('channel')}>
            <option value="slack">💬 Slack</option>
            <option value="email">📧 Email</option>
            <option value="sms">📱 SMS</option>
            <option value="push">🔔 Push</option>
          </select>
        </FormField>
        <FormField label="Severity" error={errors.severity?.message} required>
          <select id="notif-severity" className="form-select" {...register('severity')}>
            <option value="info">ℹ Info</option>
            <option value="success">✓ Success</option>
            <option value="warning">⚠ Warning</option>
            <option value="error">✖ Error</option>
          </select>
        </FormField>
      </div>

      <FormField label="Recipient" error={errors.recipient?.message} required>
        <input
          id="notif-recipient"
          className="form-input"
          {...register('recipient')}
          placeholder={channelPlaceholders[channel] ?? 'Recipient'}
        />
      </FormField>

      <FormField label="Message" error={errors.message?.message} required>
        <textarea
          id="notif-message"
          className="form-textarea"
          {...register('message')}
          placeholder="Notification message…"
          rows={3}
        />
      </FormField>

      <FormField label="Description" error={undefined}>
        <textarea id="notif-description" className="form-textarea" {...register('description')} placeholder="Optional description…" rows={2} />
      </FormField>
    </form>
  )
}
