import { Link } from '@tanstack/react-router'
import { FourDotMark } from '@/components/BrandMark'

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
