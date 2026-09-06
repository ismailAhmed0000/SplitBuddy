import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { money } from '@/lib/format'
import { useUpdateTab } from '@/lib/tabs'
import type { Bill } from '@/lib/bills'

type PayerMember = {
  name: string
  user: { bank_name: string | null; bank_account_number: string | null } | null
}

export function TabBillsCard({
  bills,
  tabId,
  members,
  payer,
  payerId,
  isCreator,
}: {
  bills: Bill[] | undefined
  tabId: number
  members: { id: number; name: string }[]
  payer: PayerMember | null
  payerId: number | null
  isCreator: boolean
}) {
  const [isEditingPayer, setIsEditingPayer] = useState(false)

  const count = bills?.length ?? 0
  const bankLine =
    payer?.user?.bank_name || payer?.user?.bank_account_number
      ? [payer?.user?.bank_name, payer?.user?.bank_account_number].filter(Boolean).join(' — ')
      : null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">{count > 1 ? 'Bills' : 'Bill'}</h2>
        {count > 1 && <span className="text-sm text-slate-400">{count} bills</span>}
      </div>

      <div className="mt-3">
        {count === 0 && <p className="py-4 text-sm text-slate-500">No bills on this tab yet.</p>}

        {bills?.map((bill) => (
          <Link
            key={bill.id}
            to="/bills/$billId"
            params={{ billId: String(bill.id) }}
            className="flex items-center gap-4 rounded-xl py-3 transition hover:bg-slate-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <ReceiptIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-ink">{bill.merchant_name ?? 'Receipt'}</span>
              <span className="block truncate text-xs text-slate-400 capitalize">{bill.status}</span>
            </span>
            <span className="shrink-0 text-base font-bold text-ink">{money(bill.total)}</span>
          </Link>
        ))}
      </div>

      {/* Who everyone settles up with */}
      <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          {payer ? (
            <>
              <p className="text-sm font-semibold text-ink">Pay {payer.name}</p>
              <p className="mt-0.5 truncate text-sm text-slate-500">{bankLine ?? 'No bank details added yet.'}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">No collector set for this tab yet.</p>
          )}
        </div>

        {isCreator && (
          <button
            type="button"
            onClick={() => setIsEditingPayer(true)}
            aria-label="Change collector"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a1 1 0 0 1-.464.263l-3 .75a.5.5 0 0 1-.606-.606l.75-3a1 1 0 0 1 .263-.464l8.5-8.5a2 2 0 0 1 .229-.271Z" />
            </svg>
          </button>
        )}
      </div>

      {isEditingPayer && (
        <EditPayerModal tabId={tabId} members={members} payerId={payerId} onClose={() => setIsEditingPayer(false)} />
      )}
    </div>
  )
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3Z" />
      <path strokeLinecap="round" d="M9 8h6M9 11.5h6M9 15h4" />
    </svg>
  )
}

function EditPayerModal({
  tabId,
  members,
  payerId,
  onClose,
}: {
  tabId: number
  members: { id: number; name: string }[]
  payerId: number | null
  onClose: () => void
}) {
  const updateTab = useUpdateTab(tabId)
  const [selected, setSelected] = useState<number | ''>(payerId ?? '')

  function handleSave() {
    updateTab.mutate({ payer_id: selected === '' ? null : selected }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Change collector</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : '')}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">No collector set</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateTab.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateTab.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
