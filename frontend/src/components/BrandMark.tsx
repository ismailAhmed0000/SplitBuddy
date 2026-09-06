export function FourDotMark({ size = 36 }: { size?: number }) {
  const dotSize = size * 0.67
  const offset = size * 0.39

  const dots = [
    { top: 0, left: 0, className: 'bg-ink/90' },
    { top: 0, left: offset, className: 'bg-slate-400/80' },
    { top: offset, left: 0, className: 'bg-slate-500/80' },
    { top: offset, left: offset, className: 'bg-slate-300/80' },
  ]

  return (
    <span className="relative block shrink-0" style={{ height: size, width: size }} aria-hidden="true">
      {dots.map((dot) => (
        <span
          key={`${dot.top}-${dot.left}`}
          className={`absolute rounded-full mix-blend-multiply ${dot.className}`}
          style={{ top: dot.top, left: dot.left, height: dotSize, width: dotSize }}
        />
      ))}
    </span>
  )
}
