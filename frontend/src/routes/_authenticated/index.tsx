import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsBanner } from '@/components/AnalyticsBanner'
import { UploadBillCard } from '@/components/UploadBillCard'
import { RecentActivityCard } from '@/components/RecentActivityCard'
import { useCurrentUser } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: user } = useCurrentUser()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-bold text-ink">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-slate-500">Here's where things stand.</p>

      <div className="mt-8">
        <AnalyticsBanner />
      </div>

      <div className="mt-6">
        <UploadBillCard />
      </div>

      <div className="mt-6">
        <RecentActivityCard />
      </div>
    </main>
  )
}
