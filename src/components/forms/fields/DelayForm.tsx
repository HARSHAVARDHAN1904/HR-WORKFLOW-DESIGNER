import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWorkflowStore } from '@/store/workflowStore'
import { delaySchema, type DelayFormValues } from '@/schemas/nodeSchemas'
import type { DelayData } from '@/types/workflow'
import { FormField } from './FormField'

interface DelayFormProps {
  nodeId: string
  data: DelayData
}

/** Fully-controlled form for Delay nodes. */
export default function DelayForm({ nodeId, data }: DelayFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  const { register, watch, reset, formState: { errors } } = useForm<DelayFormValues>({
    resolver: zodResolver(delaySchema),
    mode: 'onChange',
    defaultValues: {
      label: data.label,
      delayUnit: data.delayUnit,
      duration: data.duration,
      description: data.description,
    },
  })

  useEffect(() => {
    reset({
      label: data.label,
      delayUnit: data.delayUnit,
      duration: data.duration,
      description: data.description,
    })
  }, [nodeId, reset, data.label, data.delayUnit, data.duration, data.description])

  useEffect(() => {
    const subscription = watch((values) => {
      updateNodeData(nodeId, {
        ...values,
        duration: Number(values.duration),
      } as Partial<DelayData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateNodeData, nodeId])

  const duration = watch('duration')
  const unit = watch('delayUnit')

  return (
    <form className="node-form" aria-label="Delay node configuration" noValidate>
      <FormField label="Label" error={errors.label?.message} required>
        <input id="delay-label" className="form-input" {...register('label')} placeholder="Delay name" />
      </FormField>

      <div className="form-row-2">
        <FormField label="Duration" error={errors.duration?.message} required>
          <input
            id="delay-duration"
            className="form-input"
            type="number"
            min={1}
            {...register('duration', { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Unit" error={errors.delayUnit?.message} required>
          <select id="delay-unit" className="form-select" {...register('delayUnit')}>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </FormField>
      </div>

      <div className="form-delay-preview">
        ⏱ Pauses for <strong>{duration} {unit}</strong>
      </div>

      <FormField label="Description" error={undefined}>
        <textarea id="delay-description" className="form-textarea" {...register('description')} placeholder="Optional description…" rows={2} />
      </FormField>
    </form>
  )
}
