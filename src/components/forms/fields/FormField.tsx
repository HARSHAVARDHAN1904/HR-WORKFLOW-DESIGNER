import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

/** Reusable form field wrapper with label, error message, and required indicator. */
export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="form-required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <span className="form-error" role="alert">{error}</span>
      )}
    </div>
  )
}
