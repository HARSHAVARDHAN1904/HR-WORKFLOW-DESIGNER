import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWorkflowStore } from '@/store/workflowStore'
import { actionSchema, type ActionFormValues } from '@/schemas/nodeSchemas'
import type { ActionData } from '@/types/workflow'
import { FormField } from './FormField'

interface ActionFormProps {
  nodeId: string
  data: ActionData
}

/** Fully-controlled form for Action nodes. */
export default function ActionForm({ nodeId, data }: ActionFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  const { register, watch, reset, formState: { errors } } = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    mode: 'onChange',
    defaultValues: {
      label: data.label,
      actionType: data.actionType,
      httpMethod: data.httpMethod,
      httpUrl: data.httpUrl,
      emailTo: data.emailTo,
      emailSubject: data.emailSubject,
      emailBody: data.emailBody,
      dbQuery: data.dbQuery,
      transformScript: data.transformScript,
      description: data.description,
    },
  })

  useEffect(() => {
    reset({
      label: data.label,
      actionType: data.actionType,
      httpMethod: data.httpMethod,
      httpUrl: data.httpUrl,
      emailTo: data.emailTo,
      emailSubject: data.emailSubject,
      emailBody: data.emailBody,
      dbQuery: data.dbQuery,
      transformScript: data.transformScript,
      description: data.description,
    })
  }, [nodeId, reset, data.label, data.actionType, data.httpMethod, data.httpUrl, data.emailTo, data.emailSubject, data.emailBody, data.dbQuery, data.transformScript, data.description])

  useEffect(() => {
    const subscription = watch((values) => {
      updateNodeData(nodeId, values as Partial<ActionData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateNodeData, nodeId])

  const actionType = watch('actionType')

  return (
    <form className="node-form" aria-label="Action node configuration" noValidate>
      <FormField label="Label" error={errors.label?.message} required>
        <input id="action-label" className="form-input" {...register('label')} placeholder="Action name" />
      </FormField>

      <FormField label="Action Type" error={errors.actionType?.message} required>
        <select id="action-type" className="form-select" {...register('actionType')}>
          <option value="http">🌐 HTTP Request</option>
          <option value="email">📧 Send Email</option>
          <option value="database">🗄 Database Query</option>
          <option value="transform">🔄 Transform Data</option>
        </select>
      </FormField>

      {actionType === 'http' && (
        <>
          <FormField label="HTTP Method" error={errors.httpMethod?.message} required>
            <select id="action-method" className="form-select" {...register('httpMethod')}>
              {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </FormField>
          <FormField label="URL" error={errors.httpUrl?.message} required>
            <input id="action-url" className="form-input" {...register('httpUrl')} placeholder="https://api.example.com/endpoint" type="url" />
          </FormField>
        </>
      )}

      {actionType === 'email' && (
        <>
          <FormField label="To" error={errors.emailTo?.message} required>
            <input id="action-email-to" className="form-input" {...register('emailTo')} placeholder="recipient@example.com" type="email" />
          </FormField>
          <FormField label="Subject" error={errors.emailSubject?.message} required>
            <input id="action-email-subject" className="form-input" {...register('emailSubject')} placeholder="Email subject" />
          </FormField>
          <FormField label="Body" error={errors.emailBody?.message}>
            <textarea id="action-email-body" className="form-textarea" {...register('emailBody')} placeholder="Email body…" rows={3} />
          </FormField>
        </>
      )}

      {actionType === 'database' && (
        <FormField label="SQL Query" error={errors.dbQuery?.message} required>
          <textarea id="action-db-query" className="form-textarea form-textarea--mono" {...register('dbQuery')} placeholder="SELECT * FROM users WHERE …" rows={4} />
        </FormField>
      )}

      {actionType === 'transform' && (
        <FormField label="Transform Script" error={errors.transformScript?.message} required>
          <textarea id="action-transform" className="form-textarea form-textarea--mono" {...register('transformScript')} placeholder="return { ...data, processed: true }" rows={4} />
        </FormField>
      )}

      <FormField label="Description" error={undefined}>
        <textarea id="action-description" className="form-textarea" {...register('description')} placeholder="Optional description…" rows={2} />
      </FormField>
    </form>
  )
}
