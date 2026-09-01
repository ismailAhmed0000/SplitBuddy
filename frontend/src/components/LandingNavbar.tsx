import { Link } from '@tanstack/react-router'

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingNavbar() {
  return (
    <header className="relative flex h-24 items-center justify-between px-6 sm:px-10">
      <Link to="/welcome" className="flex items-center gap-3">
        <FourDotMark />
        <span className="text-xl font-bold text-ink">SplitBuddy</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
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

      <div className="flex items-center gap-6">
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
    </header>
  )
}

function FourDotMark() {
  const dots = [
    { top: 0, left: 0, className: 'bg-brand-500/80' },
    { top: 0, left: 14, className: 'bg-brand-300/80' },
    { top: 14, left: 0, className: 'bg-brand-700/80' },
    { top: 14, left: 14, className: 'bg-brand-400/80' },
  ]

  return (
    <span className="relative block h-9 w-9" aria-hidden="true">
      {dots.map((dot) => (
        <span
          key={`${dot.top}-${dot.left}`}
          className={`absolute h-6 w-6 rounded-full mix-blend-multiply ${dot.className}`}
          style={{ top: dot.top, left: dot.left }}
        />
      ))}
    </span>
  )
}
