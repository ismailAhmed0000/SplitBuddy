import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { TextField } from '@/components/TextField'
import { getStoredToken, parseApiError } from '@/lib/api'
import { useLogin } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (getStoredToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    login.mutate(
      { email, password },
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
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to your SplitBuddy account.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}

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
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <button
            type="submit"
            disabled={login.isPending}
            className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-violet-600 hover:text-violet-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
