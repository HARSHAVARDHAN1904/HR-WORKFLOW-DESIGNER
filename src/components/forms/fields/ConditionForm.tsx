import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWorkflowStore } from '@/store/workflowStore'
import { conditionSchema, type ConditionFormValues } from '@/schemas/nodeSchemas'
import type { ConditionData } from '@/types/workflow'
import { FormField } from './FormField'

interface ConditionFormProps {
  nodeId: string
  data: ConditionData
}

const OPERATORS = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith'] as const

/** Fully-controlled form for Condition nodes. */
export default function ConditionForm({ nodeId, data }: ConditionFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  const { register, watch, reset, formState: { errors } } = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionSchema),
    mode: 'onChange',
    defaultValues: {
      label: data.label,
      conditionType: data.conditionType,
      expression: data.expression,
      leftOperand: data.leftOperand,
      operator: data.operator,
      rightOperand: data.rightOperand,
      description: data.description,
    },
  })

  useEffect(() => {
    reset({
      label: data.label,
      conditionType: data.conditionType,
      expression: data.expression,
      leftOperand: data.leftOperand,
      operator: data.operator,
      rightOperand: data.rightOperand,
      description: data.description,
    })
  }, [nodeId, reset, data.label, data.conditionType, data.expression, data.leftOperand, data.operator, data.rightOperand, data.description])

  useEffect(() => {
    const subscription = watch((values) => {
      updateNodeData(nodeId, values as Partial<ConditionData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateNodeData, nodeId])

  const conditionType = watch('conditionType')

  return (
    <form className="node-form" aria-label="Condition node configuration" noValidate>
      <FormField label="Label" error={errors.label?.message} required>
        <input id="condition-label" className="form-input" {...register('label')} placeholder="Condition name" />
      </FormField>

      <FormField label="Condition Type" error={errors.conditionType?.message} required>
        <select id="condition-type" className="form-select" {...register('conditionType')}>
          <option value="comparison">⚖ Comparison</option>
          <option value="expression">📝 Expression</option>
          <option value="exists">🔍 Field Exists</option>
        </select>
      </FormField>

      {conditionType === 'comparison' && (
        <div className="form-row-3">
          <FormField label="Left" error={errors.leftOperand?.message} required>
            <input id="cond-left" className="form-input" {...register('leftOperand')} placeholder="field.name" />
          </FormField>
          <FormField label="Op" error={errors.operator?.message} required>
            <select id="cond-op" className="form-select" {...register('operator')}>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Right" error={errors.rightOperand?.message} required>
            <input id="cond-right" className="form-input" {...register('rightOperand')} placeholder="value" />
          </FormField>
        </div>
      )}

      {conditionType === 'expression' && (
        <FormField label="Expression" error={errors.expression?.message} required>
          <textarea
            id="cond-expression"
            className="form-textarea form-textarea--mono"
            {...register('expression')}
            placeholder="data.status === 'active' && data.count > 0"
            rows={3}
          />
        </FormField>
      )}

      {conditionType === 'exists' && (
        <FormField label="Field Path" error={errors.leftOperand?.message} required>
          <input id="cond-exists" className="form-input" {...register('leftOperand')} placeholder="data.user.email" />
        </FormField>
      )}

      <div className="form-info">
        <span className="form-info__dot form-info__dot--true">T</span> True → top-left handle
        <span className="form-info__dot form-info__dot--false" style={{ marginLeft: 12 }}>F</span> False → top-right handle
      </div>

      <FormField label="Description" error={undefined}>
        <textarea id="cond-description" className="form-textarea" {...register('description')} placeholder="Optional description…" rows={2} />
      </FormField>
    </form>
  )
}
