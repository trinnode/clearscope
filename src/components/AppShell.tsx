'use client'

import { useData } from '@/data/provider'
import Sidebar from './Sidebar'
import MobileNavbar from './MobileNavbar'
import IdentityLauncher from './IdentityLauncher'
import Logo from './Logo'
import { AlertTriangle, RefreshCw } from 'lucide-react'

function ShellLoader() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-0 text-white">
      <Logo markOnly markClassName="w-10 h-10 text-brand mb-8" />
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-console-dot rounded-full bg-brand" />
        <span
          className="h-1.5 w-1.5 animate-console-dot rounded-full bg-brand"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="h-1.5 w-1.5 animate-console-dot rounded-full bg-brand"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.25em] text-white/40">
        connecting console
      </p>
    </div>
  )
}

function ShellError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-0 px-6 text-white">
      <AlertTriangle className="mb-6 h-8 w-8 text-fail" />
      <h1 className="font-display text-3xl font-medium uppercase tracking-tight">
        Console offline
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-white/50">
        The console could not reach its data layer. Check that the server is
        running and try again.
      </p>
      <button onClick={onRetry} className="btn-pill mt-8">
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { db, loading, error, refresh, activeRole, signedIn } = useData()

  if (loading) return <ShellLoader />
  if (error) return <ShellError onRetry={refresh} />
  if (!db) return <ShellLoader />

  const hasActiveSession =
    activeRole && signedIn[activeRole] && db.identities[activeRole]

  if (!hasActiveSession) {
    return <IdentityLauncher />
  }

  return (
    <div className="relative min-h-screen bg-surface-0 text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(125,211,252,0.10),transparent_60%)]"
      />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNavbar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-content px-6 py-10 sm:px-10 sm:py-14">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}