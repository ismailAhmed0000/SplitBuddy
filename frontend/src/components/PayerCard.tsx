import { useState } from 'react'
import { useUpdateGroup } from '@/lib/groups'

type PayerMember = {
  name: string
  user: { bank_name: string | null; bank_account_number: string | null } | null
}

export function PayerCard({
  groupId,
  members,
  payerId,
  payer,
  isCreator,
}: {
  groupId: number
  members: { id: number; name: string }[]
  payerId: number | null
  payer: PayerMember | null
  isCreator: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Payer</h2>
          <p className="mt-1 text-sm text-slate-500">Everyone pays their share to whoever is set here.</p>
        </div>

        {isCreator && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit payer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a1 1 0 0 1-.464.263l-3 .75a.5.5 0 0 1-.606-.606l.75-3a1 1 0 0 1 .263-.464l8.5-8.5a2 2 0 0 1 .229-.271Z" />
            </svg>
          </button>
        )}
      </div>

      {payer ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-ink">Pay {payer.name}</p>
          {payer.user?.bank_name || payer.user?.bank_account_number ? (
            <p className="mt-1 text-sm text-slate-500">
              {payer.user.bank_name} {payer.user.bank_account_number && `— ${payer.user.bank_account_number}`}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">No bank details added yet.</p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          {isCreator ? 'No payer set yet — tap the pencil to choose one.' : 'No payer has been set for this group yet.'}
        </p>
      )}

      {isEditing && (
        <EditPayerModal groupId={groupId} members={members} payerId={payerId} onClose={() => setIsEditing(false)} />
      )}
    </div>
  )
}

function EditPayerModal({
  groupId,
  members,
  payerId,
  onClose,
}: {
  groupId: number
  members: { id: number; name: string }[]
  payerId: number | null
  onClose: () => void
}) {
  const updateGroup = useUpdateGroup(groupId)
  const [selected, setSelected] = useState<number | ''>(payerId ?? '')

  function handleSave() {
    updateGroup.mutate({ payer_id: selected === '' ? null : selected }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Edit payer</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : '')}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">No payer set</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateGroup.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateGroup.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
