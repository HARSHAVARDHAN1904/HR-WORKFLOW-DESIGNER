import { z } from 'zod'

// ── Per-node Zod schemas ───────────────────────────────────────────────────────
// These are reused by both form validation (zodResolver) and graphValidation.ts

export const triggerSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  triggerType: z.enum(['schedule', 'webhook', 'manual', 'event']),
  cronExpression: z.string().optional(),
  webhookUrl: z.string().optional(),
  eventName: z.string().optional(),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.triggerType === 'schedule' && !data.cronExpression) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cron expression required', path: ['cronExpression'] })
  }
  if (data.triggerType === 'webhook' && !data.webhookUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Webhook URL required', path: ['webhookUrl'] })
  }
  if (data.triggerType === 'event' && !data.eventName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Event name required', path: ['eventName'] })
  }
})

export const actionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  actionType: z.enum(['http', 'email', 'database', 'transform']),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  httpUrl: z.string().optional(),
  emailTo: z.string().optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  dbQuery: z.string().optional(),
  transformScript: z.string().optional(),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.actionType === 'http' && !data.httpUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'HTTP URL required', path: ['httpUrl'] })
  }
  if (data.actionType === 'email') {
    if (!data.emailTo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recipient required', path: ['emailTo'] })
    if (!data.emailSubject) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Subject required', path: ['emailSubject'] })
  }
  if (data.actionType === 'database' && !data.dbQuery) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SQL query required', path: ['dbQuery'] })
  }
  if (data.actionType === 'transform' && !data.transformScript) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Transform script required', path: ['transformScript'] })
  }
})

export const conditionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  conditionType: z.enum(['expression', 'comparison', 'exists']),
  expression: z.string().optional(),
  leftOperand: z.string().optional(),
  operator: z.enum(['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith']),
  rightOperand: z.string().optional(),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.conditionType === 'expression' && !data.expression) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Expression required', path: ['expression'] })
  }
  if (data.conditionType === 'comparison') {
    if (!data.leftOperand) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Left operand required', path: ['leftOperand'] })
    if (!data.rightOperand) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Right operand required', path: ['rightOperand'] })
  }
  if (data.conditionType === 'exists' && !data.leftOperand) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Field name required', path: ['leftOperand'] })
  }
})

export const delaySchema = z.object({
  label: z.string().min(1, 'Label is required'),
  delayUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
  duration: z.number().min(1, 'Duration must be at least 1'),
  description: z.string().optional(),
})

export const notificationSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  channel: z.enum(['slack', 'email', 'sms', 'push']),
  recipient: z.string().min(1, 'Recipient is required'),
  message: z.string().min(1, 'Message is required'),
  severity: z.enum(['info', 'warning', 'error', 'success']),
  description: z.string().optional(),
})

export type TriggerFormValues = z.infer<typeof triggerSchema>
export type ActionFormValues = z.infer<typeof actionSchema>
export type ConditionFormValues = z.infer<typeof conditionSchema>
export type DelayFormValues = z.infer<typeof delaySchema>
export type NotificationFormValues = z.infer<typeof notificationSchema>
