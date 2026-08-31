type LogoProps = {
  markOnly?: boolean
  className?: string
  markClassName?: string
}

export default function Logo({
  markOnly = false,
  className = '',
  markClassName = 'w-5 h-5',
}: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-ink-900 font-mono tracking-tight ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={markClassName}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2.25" />
        <line x1="12" y1="0.5" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="23.5" />
        <line x1="0.5" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="23.5" y2="12" />
      </svg>
      {!markOnly && <span className="text-sm tracking-widest">CLEARSCOPE</span>}
    </span>
  )
}
