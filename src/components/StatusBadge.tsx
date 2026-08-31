import type { PolicyResult, RequestStatus } from '@/lib/sdk/types'

function getStatusConfig(status: RequestStatus | PolicyResult): {
  label: string
  className: string
} {
  switch (status) {
    case 'PASS':
      return { label: 'Pass', className: 'console-chip-pass' }
    case 'FAIL':
      return { label: 'Fail', className: 'console-chip-fail' }
    case 'INSUFFICIENT_SCOPE':
      return { label: 'Insufficient scope', className: 'console-chip-pending' }
    case 'PENDING':
      return { label: 'Pending', className: 'console-chip-pending' }
    case 'RESPONDED':
      return { label: 'Responded', className: 'console-chip-pass' }
    case 'EXPIRED':
      return { label: 'Expired', className: 'console-chip-neutral' }
    default:
      return { label: status, className: 'console-chip-neutral' }
  }
}

export default function StatusBadge({
  status,
}: {
  status: RequestStatus | PolicyResult
}) {
  const config = getStatusConfig(status)
  return (
    <span className={config.className}>
      <span className="w-1 h-1 rounded-full bg-current" />
      {config.label}
    </span>
  )
}
