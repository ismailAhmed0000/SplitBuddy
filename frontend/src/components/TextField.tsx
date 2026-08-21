import { useId, type InputHTMLAttributes } from 'react'

type TextFieldProps = {
  label: string
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className ?? ''}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
