export function Seal({ fill, stroke, textColor, label }: { fill: string; stroke: string; textColor: string; label: string }) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className="h-9 w-9 shrink-0">
      <polygon
        points="150.00,20.00 164.62,38.96 183.65,24.43 192.86,46.53 215.00,37.42 218.18,61.14 241.92,58.08 238.86,81.82 262.58,85.00 253.47,107.14 275.57,116.35 261.04,135.38 280.00,150.00 261.04,164.62 275.57,183.65 253.47,192.86 262.58,215.00 238.86,218.18 241.92,241.92 218.18,238.86 215.00,262.58 192.86,253.47 183.65,275.57 164.62,261.04 150.00,280.00 135.38,261.04 116.35,275.57 107.14,253.47 85.00,262.58 81.82,238.86 58.08,241.92 61.14,218.18 37.42,215.00 46.53,192.86 24.43,183.65 38.96,164.62 20.00,150.00 38.96,135.38 24.43,116.35 46.53,107.14 37.42,85.00 61.14,81.82 58.08,58.08 81.82,61.14 85.00,37.42 107.14,46.53 116.35,24.43 135.38,38.96"
        fill={fill}
        stroke={stroke}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="150" cy="150" r="106" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="6,6" opacity="0.9" />
      <text
        x="150"
        y="160"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        fontSize="30"
        fill={textColor}
        letterSpacing="1"
        transform="rotate(-45 150 150)"
      >
        {label}
      </text>
    </svg>
  )
}

export function CollectorBadge({
  isPayer,
  canSet,
  onSetPayer,
  pending,
}: {
  isPayer: boolean
  canSet?: boolean
  onSetPayer?: () => void
  pending?: boolean
}) {
  if (isPayer) {
    return (
      <span role="img" aria-label="Collector" title="Collector">
        <Seal fill="#00a86b" stroke="#006b44" textColor="#ffffff" label="COLLECTOR" />
      </span>
    )
  }

  if (!canSet) return null

  return (
    <button
      type="button"
      onClick={onSetPayer}
      disabled={pending}
      aria-label="Set as collector"
      title="Set as collector"
      className="shrink-0 opacity-50 grayscale transition hover:opacity-80 hover:grayscale-0 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Seal fill="#94a3b8" stroke="#64748b" textColor="#ffffff" label="COLLECTOR" />
    </button>
  )
}
