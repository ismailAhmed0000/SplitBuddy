import { useState } from 'react'

export function TabHeader({
  name,
  isCreator,
  onRename,
  onDelete,
}: {
  name: string
  isCreator: boolean
  onRename: (name: string) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEditing() {
    setDraft(name)
    setIsEditing(true)
  }

  function save() {
    if (draft.trim() && draft.trim() !== name) {
      onRename(draft.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        {isEditing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="min-w-0 rounded-lg border border-brand-300 px-2 py-1 text-2xl font-bold text-ink outline-none focus:ring-2 focus:ring-brand-500/50 sm:text-4xl"
          />
        ) : (
          <h1
            onClick={() => isCreator && startEditing()}
            className={`min-w-0 truncate text-2xl font-bold text-ink sm:text-4xl ${isCreator ? 'cursor-pointer hover:text-brand-700' : ''}`}
          >
            {name}
          </h1>
        )}
      </div>

      {isCreator && (
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-full border border-error-200 px-4 py-2 text-sm font-semibold text-error-600 transition hover:bg-error-50"
        >
          Delete tab
        </button>
      )}
    </div>
  )
}
