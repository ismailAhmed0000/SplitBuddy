import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { clearStoredToken, getStoredToken } from '@/lib/api'
import { useCurrentUser } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!getStoredToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const { isLoading, isError } = useCurrentUser()

  useEffect(() => {
    if (isError) {
      clearStoredToken()
      navigate({ to: '/login' })
    }
  }, [isError, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-canvas">
      <Navbar />
      <Outlet />
    </div>
  )
}
