import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { clearStoredToken, getStoredToken } from '@/lib/api'
import { useCurrentUser, useLogout } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (!getStoredToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useCurrentUser()
  const logout = useLogout()

  useEffect(() => {
    if (isError) {
      clearStoredToken()
      navigate({ to: '/login' })
    }
  }, [isError, navigate])

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/login' }),
    })
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {logout.isPending ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </div>
  )
}
