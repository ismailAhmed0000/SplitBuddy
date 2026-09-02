import { useState } from 'react'
import { useExportMessages, type ExportMessagesResult } from '@/lib/groups'
import { MemberAvatar } from './MemberAvatar'

type Member = { id: number; name: string }

export function GenerateMessageModal({
  groupId,
  members,
  onClose,
}: {
  groupId: number
  members: Member[]
  onClose: () => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<ExportMessagesResult | null>(null)
  const exportMessages = useExportMessages(groupId)

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelectedIds((prev) => (prev.size === members.length ? new Set() : new Set(members.map((m) => m.id))))
  }

  function handleGenerate() {
    exportMessages.mutate(Array.from(selectedIds), { onSuccess: setResult })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Generate message</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        {!result ? (
          <>
            <p className="mt-1 text-sm text-slate-500">Select who to generate a "what you owe" message for.</p>

            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                {selectedIds.size} selected
              </span>
              <button type="button" onClick={toggleAll} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                {selectedIds.size === members.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="mt-2 flex flex-col">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => toggle(member.id)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <MemberAvatar name={member.name} size={32} />
                  <span className="truncate text-sm font-medium text-ink">{member.name}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={selectedIds.size === 0 || exportMessages.isPending}
              className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportMessages.isPending ? 'Generating…' : 'Generate message'}
            </button>
          </>
        ) : (
          <ResultView result={result} onBack={() => setResult(null)} />
        )}
      </div>
    </div>
  )
}

function ResultView({ result, onBack }: { result: ExportMessagesResult; onBack: () => void }) {
  const showCombined = result.data.length > 1

  return (
    <div className="mt-4 flex flex-col gap-5">
      {showCombined && <MessageBlock label="Combined message" text={result.combined_message} />}

      <div className="flex flex-col gap-4">
        {showCombined && (
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Individual messages</p>
        )}
        {result.data.map((entry) => (
          <MessageBlock key={entry.group_member_id} label={entry.name} text={entry.message} />
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        ← Back to selection
      </button>
    </div>
  )
}

function MessageBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-ink">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-700">{text}</pre>
    </div>
  )
}
