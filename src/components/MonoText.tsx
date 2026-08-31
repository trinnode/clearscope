'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function MonoText({
  children,
  copyable = false,
}: {
  children: string
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)

  if (!copyable) {
    return (
      <span className="font-code text-sm text-white/50 break-all">
        {children}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-code text-sm text-white/50 break-all">
      {children}
      <button
        onClick={() => {
          navigator.clipboard.writeText(children)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="text-white/30 hover:text-white transition-colors cursor-pointer flex-shrink-0"
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-pass" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </span>
  )
}
