import Reveal from './Reveal'

export default function PageHeader({
  index,
  section,
  title,
  description,
  actions,
}: {
  index: string
  section: string
  title: React.ReactNode
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="mb-12">
      <Reveal className="mb-4">
        <p className="console-label">
          ( <span className="text-brand">{index}</span> ) / [ {section} ]
        </p>
      </Reveal>
      <Reveal delay={60}>
        <h1 className="console-heading">{title}</h1>
      </Reveal>
      {description && (
        <Reveal delay={120}>
          <p className="console-sub mt-4">{description}</p>
        </Reveal>
      )}
      {actions && (
        <Reveal delay={180}>
          <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>
        </Reveal>
      )}
    </header>
  )
}
