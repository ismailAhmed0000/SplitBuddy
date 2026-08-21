import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCurrentUser, useLogout } from '@/lib/auth'
import { NotificationsBell } from '@/components/NotificationsBell'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/groups', label: 'Groups' },
  { to: '/bills', label: 'Bills' },
  { to: '/buddies', label: 'Buddies' },
] as const

export function Navbar() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/login' }),
    })
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

  const linkClass =
    'text-sm font-medium text-slate-600 transition hover:text-slate-900 [&.active]:text-violet-600'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            SplitBuddy
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass} activeOptions={{ exact: link.to === '/' }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <NotificationsBell />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
              {initial}
            </span>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationsBell />
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
          >
            {isMenuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === '/' }}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 [&.active]:bg-violet-50 [&.active]:text-violet-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 px-2 pt-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
              {initial}
            </span>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      )}
    </header>
  )
}
