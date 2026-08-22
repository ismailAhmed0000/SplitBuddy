import { QRCodeSVG } from 'qrcode.react'
import type { User } from '@/lib/auth'

const QR_PREFIX = 'splitbuddy:buddy:'

export function buddyQrValue(username: string): string {
  return `${QR_PREFIX}${username}`
}

export function parseBuddyQrValue(text: string): string {
  return text.startsWith(QR_PREFIX) ? text.slice(QR_PREFIX.length) : text.trim()
}

export function BuddyQrCode({ user }: { user: User }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-xl border border-slate-100 p-3">
        <QRCodeSVG value={buddyQrValue(user.username)} size={176} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-ink">@{user.username}</p>
        <p className="text-xs text-slate-500">Let a buddy scan this to add you</p>
      </div>
    </div>
  )
}
