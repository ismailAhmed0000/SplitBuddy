import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { TextField } from '@/components/TextField'
import { parseApiError } from '@/lib/api'
import { useCurrentUser, type User } from '@/lib/auth'
import { useUpdateUser } from '@/lib/users'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: user } = useCurrentUser()

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    )
  }

  return <SettingsForm key={user.id} user={user} />
}

function SettingsForm({ user }: { user: User }) {
  const updateUser = useUpdateUser(user.id)

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [bankName, setBankName] = useState(user.bank_name ?? '')
  const [bankAccountNumber, setBankAccountNumber] = useState(user.bank_account_number ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [savedAt, setSavedAt] = useState<number | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setSavedAt(null)

    updateUser.mutate(
      {
        name,
        username,
        email,
        phone: phone || null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
      },
      {
        onSuccess: () => setSavedAt(Date.now()),
        onError: (error) => {
          const parsed = parseApiError(error)
          setFormError(parsed.message)
          setFieldErrors(parsed.fieldErrors)
        },
      },
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your profile and how buddies pay you back.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6" noValidate>
        {formError && <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">{formError}</p>}
        {savedAt && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">Saved.</p>}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Profile</h2>
          <div className="mt-4 flex flex-col gap-4">
            <TextField
              label="Name"
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
            />
            <TextField
              label="Username"
              type="text"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={fieldErrors.username}
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
            />
            <TextField
              label="Phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={fieldErrors.phone}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Bank details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Shown to your group buddies so they know where to send money — SplitBuddy doesn't process payments.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <TextField
              label="Bank name"
              type="text"
              name="bank_name"
              placeholder="e.g. Chase, GTBank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              error={fieldErrors.bank_name}
            />
            <TextField
              label="Account number"
              type="text"
              name="bank_account_number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              error={fieldErrors.bank_account_number}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updateUser.isPending}
          className="self-start rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateUser.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </main>
  )
}
