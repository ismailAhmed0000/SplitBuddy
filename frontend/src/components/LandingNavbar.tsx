import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FourDotMark } from '@/components/BrandMark'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative flex h-24 items-center justify-between px-4 sm:px-10">
      <Link to="/welcome" className="flex min-w-0 items-center gap-2 sm:gap-3">
        <FourDotMark />
        <span className="truncate text-lg font-bold text-ink sm:text-xl">SplitBuddy</span>
        <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:inline-flex">
          Coming soon
        </span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="text-sm text-slate-600 transition hover:text-ink">
            {link.label}
          </a>
        ))}
      </nav>

      {/* Desktop */}
      <div className="hidden items-center gap-6 md:flex">
        <Link to="/login" className="text-sm font-medium text-ink transition hover:text-slate-600">
          Login
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Register
        </Link>
      </div>

      {/* Mobile */}
      <div className="flex shrink-0 items-center gap-2 md:hidden">
        <Link
          to="/register"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Register
        </Link>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
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

      {/* Mobile panel */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-ink/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full right-4 left-4 z-30 mt-2 rounded-3xl bg-white p-6 shadow-xl md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base text-slate-600 transition hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 block border-t border-slate-100 pt-4 text-base font-medium text-ink"
            >
              Login
            </Link>
          </div>
        </>
      )}
    </header>
  )
}
