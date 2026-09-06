import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { TabHeader } from '@/components/TabHeader'
import { BalancesCard } from '@/components/BalancesCard'
import { TabBillsCard } from '@/components/TabBillsCard'
import { useCurrentUser } from '@/lib/auth'
import { useDeleteTab, useTab, useTabBalances, useUpdateTab } from '@/lib/tabs'
import { useBills } from '@/lib/bills'

export const Route = createFileRoute('/_authenticated/tabs/$tabId')({
  component: TabDetailPage,
})

function TabDetailPage() {
  const navigate = useNavigate()
  const { tabId } = Route.useParams()
  const id = Number(tabId)

  const { data: currentUser } = useCurrentUser()
  const { data: tab, isLoading } = useTab(id)
  const { data: balances } = useTabBalances(id)
  const { data: bills } = useBills(id)
  const updateTab = useUpdateTab(id)
  const deleteTab = useDeleteTab()

  const isCreator = tab?.created_by === currentUser?.id

  function handleDeleteTab() {
    if (confirm(`Delete "${tab?.name}"? This removes its bill and settlements.`)) {
      deleteTab.mutate(id, { onSuccess: () => navigate({ to: '/tabs' }) })
    }
  }

  if (isLoading || !tab) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  const myMemberId = tab.members.find((m) => m.user_id === currentUser?.id)?.id

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/tabs" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to tabs
      </Link>

      <div className="mt-4">
        <TabHeader
          name={tab.name}
          isCreator={isCreator}
          onRename={(name) => updateTab.mutate({ name })}
          onDelete={handleDeleteTab}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <TabBillsCard
          bills={bills}
          tabId={id}
          members={tab.members}
          payer={tab.payer}
          payerId={tab.payer_id}
          isCreator={isCreator}
        />
        <BalancesCard
          groupId={id}
          balances={balances ?? []}
          payerId={tab.payer_id}
          payerName={tab.payer?.name}
          myMemberId={myMemberId}
        />
      </div>
    </main>
  )
}
