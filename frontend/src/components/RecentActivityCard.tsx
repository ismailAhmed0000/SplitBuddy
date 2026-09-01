export function RecentActivityCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Recent activity</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest Bills and settlements.
          </p>
        </div>
      </div>
    </div>
  );
}
