export function BillStatusLegend() {
  return (
    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-brand-600" />
        Confirmed
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        Parsed
      </span>
    </div>
  )
}
