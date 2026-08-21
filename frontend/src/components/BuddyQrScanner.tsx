import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { parseBuddyQrValue } from './BuddyQrCode'

const ELEMENT_ID = 'buddy-qr-reader'

export function BuddyQrScanner({
  onScan,
  onClose,
}: {
  onScan: (username: string) => void
  onClose: () => void
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID)
    scannerRef.current = scanner
    let handled = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          if (handled) return
          handled = true
          onScan(parseBuddyQrValue(decodedText))
        },
        undefined,
      )
      .catch(() => {
        setError('Could not access the camera. Check permissions, or add a buddy by username instead.')
      })

    return () => {
      if (scanner.isScanning) {
        scanner.stop().then(() => scanner.clear()).catch(() => {})
      } else {
        scanner.clear()
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Scan a buddy code</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div id={ELEMENT_ID} className={`mt-4 overflow-hidden rounded-xl ${error ? 'hidden' : ''}`} />
      </div>
    </div>
  )
}
