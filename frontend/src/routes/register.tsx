import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { TextField } from '@/components/TextField'
import { getStoredToken, parseApiError } from '@/lib/api'
import { useRegister } from '@/lib/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (getStoredToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    register.mutate(
      {
        name,
        email,
        phone: phone || undefined,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => {
          navigate({ to: '/' })
        },
        onError: (error) => {
          const parsed = parseApiError(error)
          setFormError(parsed.message)
          setFieldErrors(parsed.fieldErrors)
        },
      },
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start splitting bills with SplitBuddy.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}

          <TextField
            label="Name"
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />

          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <TextField
            label="Phone (optional)"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={fieldErrors.phone}
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <TextField
            label="Confirm password"
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />

          <button
            type="submit"
            disabled={register.isPending}
            className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {register.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-violet-600 hover:text-violet-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
