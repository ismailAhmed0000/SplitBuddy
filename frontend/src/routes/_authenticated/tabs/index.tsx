import { createFileRoute } from '@tanstack/react-router'
import { useDeleteTab, useTabs } from '@/lib/tabs'
import { TabRow } from '@/components/TabRow'

export const Route = createFileRoute('/_authenticated/tabs/')({
  component: TabsListPage,
})

function TabsListPage() {
  const { data: tabs, isLoading } = useTabs()
  const deleteTab = useDeleteTab()

  function handleDelete(id: number) {
    if (confirm('Delete this tab? This removes its bill and settlements.')) {
      deleteTab.mutate(id)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Tabs</h1>
        <p className="mt-1 text-sm text-slate-500">
          One tab per confirmed bill — where your buddies settle up with the collector.
        </p>
      </div>

      {isLoading && <p className="mt-6 text-sm text-slate-500">Loading…</p>}

      {!isLoading && tabs?.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">
            No tabs yet. Upload a bill and confirm it to open its tab.
          </p>
        </div>
      )}

      {tabs && tabs.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {tabs.map((tab) => (
            <TabRow key={tab.id} tab={tab} onDelete={() => handleDelete(tab.id)} />
          ))}
        </div>
      )}
    </main>
  )
}
