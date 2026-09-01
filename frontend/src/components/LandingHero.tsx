export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-32 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">Launching soon</p>

        <h1 className="mt-6 text-4xl leading-tight font-extrabold text-ink sm:text-5xl md:text-6xl">
          Split bills with friends, without the awkward math.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
          SplitBuddy tracks who paid, who owes, and who's even — for trips, roommates, and nights out. Snap a
          receipt, split it your way, and settle up without the spreadsheet.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <InfoPill icon={<PhoneIcon />} label="iOS & Android — coming soon" />
          <InfoPill icon={<BrowserIcon />} label="Web app — coming soon" />
        </div>
      </div>

      <DeviceMockup />
    </section>
  )
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
      {icon}
      {label}
    </span>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" strokeLinejoin="round" />
      <path d="M10.5 18h3" strokeLinecap="round" />
    </svg>
  )
}

function BrowserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" strokeLinejoin="round" />
      <path d="M3 9h18" strokeLinecap="round" />
    </svg>
  )
}

function DeviceMockup() {
  return (
    <div
      className="pointer-events-none absolute -right-32 -bottom-16 hidden h-80 w-56 rotate-2 rounded-[1.75rem] border-[6px] border-ink bg-ink shadow-2xl sm:block"
      aria-hidden="true"
    >
      <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-[1.25rem] bg-slate-900 p-3">
        <div className="flex items-center justify-between">
          <div className="h-2 w-12 rounded-full bg-white/20" />
          <div className="rounded-full bg-brand-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">54</div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
            <div className="h-6 w-6 shrink-0 rounded-full bg-white/10" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-3/4 rounded-full bg-white/20" />
              <div className="h-1.5 w-1/2 rounded-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
