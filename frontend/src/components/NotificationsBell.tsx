import { useState } from 'react'
import { useMarkNotificationRead, useNotifications } from '@/lib/notifications'

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: notifications } = useNotifications()
  const markRead = useMarkNotificationRead()

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">You're all caught up.</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => !notification.read && markRead.mutate(notification.id)}
                    className={`block w-full border-b border-slate-50 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-slate-50 ${
                      notification.read ? 'text-slate-500' : 'font-medium text-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />}
                      <span>{notification.message}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
