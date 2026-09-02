import { createFileRoute, Link } from '@tanstack/react-router'
import { useBills, useDeleteBill, type Bill } from '@/lib/bills'
import { useGroups } from '@/lib/groups'
import { formatMonthYear } from '@/lib/format'
import { BillRow } from '@/components/BillRow'
import { BillStatusLegend } from '@/components/BillStatusLegend'

export const Route = createFileRoute('/_authenticated/bills/')({
  component: BillsListPage,
})

type BillMonthGroup = {
  key: string
  label: string
  bills: Bill[]
}

function groupBillsByMonth(bills: Bill[]): BillMonthGroup[] {
  const sorted = [...bills].sort((a, b) => {
    if (!a.bill_date) return 1
    if (!b.bill_date) return -1
    return b.bill_date.localeCompare(a.bill_date)
  })

  const groups: BillMonthGroup[] = []
  for (const bill of sorted) {
    const key = bill.bill_date ? bill.bill_date.slice(0, 7) : 'undated'
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.key === key) {
      lastGroup.bills.push(bill)
    } else {
      groups.push({ key, label: formatMonthYear(bill.bill_date), bills: [bill] })
    }
  }
  return groups
}

function BillsListPage() {
  const { data: bills, isLoading } = useBills()
  const { data: groups } = useGroups()
  const deleteBill = useDeleteBill()

  const groupNames = new Map(groups?.map((g) => [g.id, g.name]))
  const monthGroups = groupBillsByMonth(bills ?? [])

  function handleDelete(id: number) {
    if (confirm('Delete this bill? This cannot be undone.')) {
      deleteBill.mutate(id)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Bills</h1>
      <p className="mt-1 text-sm text-slate-500">Every receipt you've uploaded, across all your groups.</p>

      {isLoading && <p className="mt-6 text-sm text-slate-500">Loading…</p>}

      {!isLoading && bills?.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">
            No bills yet. Upload one from the{' '}
            <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
              dashboard
            </Link>
            .
          </p>
        </div>
      )}

      {monthGroups.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {monthGroups.map((group) => (
            <div key={group.key}>
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {group.label}
              </div>
              {group.bills.map((bill) => (
                <BillRow
                  key={bill.id}
                  bill={bill}
                  groupName={groupNames.get(bill.group_id) ?? 'Unknown group'}
                  onDelete={() => handleDelete(bill.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {monthGroups.length > 0 && <BillStatusLegend />}
    </main>
  )
}
