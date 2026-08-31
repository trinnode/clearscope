export default function EmptyState({
  marker = '( ∅ )',
  title,
  description,
}: {
  marker?: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-white/30 mb-4">
        {marker}
      </p>
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-white/70 mb-2">
        {title}
      </p>
      <p className="max-w-sm text-sm leading-relaxed text-white/40">
        {description}
      </p>
    </div>
  )
}
