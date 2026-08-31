export default function Spinner({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <span
      className={`animate-console-spin inline-block rounded-full border-2 border-white/25 border-t-white ${className}`}
      aria-hidden="true"
    />
  )
}
