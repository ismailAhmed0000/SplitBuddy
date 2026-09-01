import { useRef, useState, type DragEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateGroup, useGroups } from '@/lib/groups'
import { useUploadBill } from '@/lib/bills'
import { parseApiError } from '@/lib/api'

export function UploadBillCard() {
  const navigate = useNavigate()
  const { data: groups, isLoading: groupsLoading } = useGroups()
  const createGroup = useCreateGroup()
  const uploadBill = useUploadBill()

  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('')
  const [newGroupName, setNewGroupName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const hasGroups = (groups?.length ?? 0) > 0
  const effectiveGroupId = groups?.length === 1 ? groups[0].id : selectedGroupId
  const isSubmitting = createGroup.isPending || uploadBill.isPending

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  async function handleContinue() {
    if (!file) return
    setError(null)

    try {
      let groupId = effectiveGroupId

      if (!groupId) {
        if (!newGroupName.trim()) {
          setError('Give your group a name first.')
          return
        }
        const group = await createGroup.mutateAsync(newGroupName.trim())
        groupId = group.id
      }

      const bill = await uploadBill.mutateAsync({ groupId: groupId as number, file })
      navigate({ to: '/bills/$billId', params: { billId: String(bill.id) } })
    } catch (err) {
      setError(parseApiError(err).message)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Upload a bill</h2>
      <p className="mt-1 text-sm text-slate-500">Snap or upload a receipt and we'll read the items for you.</p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-16 text-center transition ${
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0-3.5 3.5M12 8l3.5 3.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 16.5v1a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5v-1" />
          </svg>
        </span>

        {file ? (
          <p className="mt-4 text-sm font-semibold text-slate-700">{file.name}</p>
        ) : (
          <>
            <p className="mt-4 text-sm font-semibold text-slate-700">Tap to upload or drag a photo here</p>
            <p className="mt-1 text-xs tracking-wide text-slate-400 uppercase">PNG, JPG or WEBP</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && !groupsLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {(groups?.length ?? 0) > 1 && (
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="">Select a group…</option>
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          )}

          {!hasGroups && (
            <input
              type="text"
              placeholder="Name your group (e.g. Trip to Bali)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50"
            />
          )}

          {error && <p className="text-sm text-error-600">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Reading your receipt…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
