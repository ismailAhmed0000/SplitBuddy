export function MemberAvatar({ name, isCollector, size = 40 }: { name: string; isCollector?: boolean; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        isCollector ? 'bg-brand-600 text-white' : 'bg-slate-300 text-white'
      }`}
      style={{ height: size, width: size, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  )
}
