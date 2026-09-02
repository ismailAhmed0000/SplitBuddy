import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCurrentUser, useLogout } from '@/lib/auth'
import { NotificationsBell } from '@/components/NotificationsBell'
import { FourDotMark } from '@/components/BrandMark'

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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/login' }),
    })
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

  const linkClass = 'text-sm font-medium text-slate-500 transition hover:text-ink [&.active]:font-semibold [&.active]:text-ink'

  return (
    <header className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <FourDotMark size={32} />
          <span className="text-lg font-bold text-ink">SplitBuddy</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass} activeOptions={{ exact: link.to === '/' }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <NotificationsBell />
          <div className="relative mx-1">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              aria-label="Account menu"
              aria-expanded={isProfileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {initial}
            </button>

            {isProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      handleLogout()
                    }}
                    disabled={logout.isPending}
                    className="block w-full px-4 py-2 text-left text-sm text-error-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {logout.isPending ? 'Logging out…' : 'Log out'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationsBell />
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
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
        <>
          <div
            className="fixed inset-0 z-20 bg-ink/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-4 top-full z-30 mt-2 w-64 rounded-3xl bg-white p-6 shadow-xl md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: link.to === '/' }}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-normal text-slate-400 transition hover:text-ink [&.active]:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {initial}
              </span>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="mt-3 w-full rounded-full bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {logout.isPending ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </>
      )}
    </header>
  )
}
