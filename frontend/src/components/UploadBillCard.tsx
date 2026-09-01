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
        className={`group relative mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
          isDragging ? 'scale-[1.01] border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,theme(colors.slate.400/0.06)_0px,theme(colors.slate.400/0.06)_1px,transparent_1px,transparent_10px)]" />

        {file ? (
          <div className="relative z-10 flex w-full max-w-xs items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <ImageFileIcon />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
              disabled={isSubmitting}
              aria-label="Remove file"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-error-50 hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </div>
        ) : (
          <>
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-200">
              <UploadIcon />
            </span>
            <h3 className="relative z-10 mt-4 text-base font-semibold text-slate-700">
              Tap to upload <span className="font-normal text-slate-400">or drag and drop</span>
            </h3>
            <p className="relative z-10 mt-1 text-xs tracking-wide text-slate-400 uppercase">PNG, JPG or WEBP</p>
            <span className="relative z-10 pointer-events-none mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Browse files
            </span>
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

          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Reading your receipt…' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0-3.5 3.5M12 8l3.5 3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 16.5v1a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5v-1" />
    </svg>
  )
}

function ImageFileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" strokeLinejoin="round" />
      <circle cx="9" cy="10" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 5-5 3 3 3-3 5 5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
      />
    </svg>
  )
}
