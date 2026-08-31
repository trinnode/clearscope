'use client'

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import type { Toast } from '@/data/provider'

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type]
        return (
          <div
            key={toast.id}
            className="animate-fade-up flex items-start gap-3 rounded-xl border border-white/15 bg-surface-50 px-4 py-3 shadow-card max-w-sm"
          >
            <Icon
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                toast.type === 'success'
                  ? 'text-pass'
                  : toast.type === 'error'
                    ? 'text-fail'
                    : 'text-pending'
              }`}
            />
            <p className="font-mono text-sm leading-relaxed text-white/80">
              {toast.message}
            </p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
