export const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MVR' })

export function money(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return currency.format(0)
  return currency.format(Number(value))
}

/** Parses a `YYYY-MM-DD` date-only string as a local date, avoiding UTC-parse day-shift bugs. */
function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  return parseDateOnly(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return 'Undated'
  return parseDateOnly(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
