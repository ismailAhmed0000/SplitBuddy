import type { BillStatus } from '@/lib/bills'

export function ConfirmBillCard({
  status,
  onConfirm,
  isConfirming,
}: {
  status: BillStatus
  onConfirm: () => void
  isConfirming: boolean
}) {
  if (status === 'confirmed') {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-sm font-medium text-brand-800">This bill is confirmed and counts toward balances.</p>
      </div>
    )
  }

  if (status !== 'parsed') return null

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h2 className="text-base font-semibold text-ink">Ready to confirm?</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Once you're happy with how the items above are split, confirm this bill so it counts toward everyone's
        balances.
      </p>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isConfirming}
        className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {isConfirming ? 'Confirming…' : 'Confirm bill'}
      </button>
    </div>
  )
}
