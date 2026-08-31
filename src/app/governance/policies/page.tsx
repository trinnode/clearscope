'use client'

import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { FileCode2, GitBranch, GitMerge, Plus } from 'lucide-react'

function PolicyRegistryView() {
  const { db } = useData()
  if (!db) return null

  return (
    <>
      <PageHeader
        index="04"
        section="system"
        title={
          <>
            Policy <span className="text-gradient">registry</span>
          </>
        }
        description="The public, read only source of truth for every disclosure policy ClearScope can evaluate."
        actions={
          <Link href="/governance/policies/compose" className="btn-pill">
            <Plus className="h-4 w-4" />
            Compose policy
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {db.policies.map((policy, i) => (
          <div
            key={policy.id}
            className="animate-fade-up console-card p-6"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-medium uppercase tracking-tight text-white">
                    {policy.name}
                  </h2>
                  {policy.composition && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-brand">
                      {policy.composition.operator === 'AND' ? (
                        <GitMerge className="h-3 w-3" />
                      ) : (
                        <GitBranch className="h-3 w-3" />
                      )}
                      {policy.composition.operator}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-code text-[0.75rem] text-white/30">
                  {policy.id} · v{policy.version}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/60">
              {policy.questionAsked}
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/35">
                  private input
                </span>
                <span className="font-mono text-[0.8rem] text-white/70">
                  {policy.privateInput}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/35">
                  public output
                </span>
                <span className="font-mono text-[0.8rem] text-brand">
                  {policy.publicOutput}
                </span>
              </div>
            </div>

            {policy.composition && (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                {policy.composition.components.map((id, index) => (
                  <span key={id} className="inline-flex items-center gap-2">
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-code text-[0.75rem] text-white/70">
                      {id}
                    </span>
                    {index < policy.composition!.components.length - 1 && (
                      <span className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-brand">
                        {policy.composition!.operator}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-4 flex items-center gap-1.5 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/30">
              <FileCode2 className="h-3 w-3" />
              {policy.compactSource}
            </p>
          </div>
        ))}
      </div>

      <div className="console-card mt-6 p-6">
        <p className="console-label mb-3">about the registry</p>
        <p className="max-w-3xl text-sm leading-relaxed text-white/50">
          Each policy is a pure function that takes a private credential
          attribute and public parameters, and returns exactly one of three
          results: PASS, FAIL, or INSUFFICIENT_SCOPE. Composed policies combine
          base policies with AND or OR logic and evaluate against the same
          private state. The policy logic is implemented as Compact smart
          contracts on the Midnight network, and the source files referenced
          above contain the exact logic executed during proof generation. No
          other data ever leaves private state.
        </p>
      </div>
    </>
  )
}

export default function PoliciesPage() {
  return (
    <AppShell>
      <RoleGate required="system">
        <PolicyRegistryView />
      </RoleGate>
    </AppShell>
  )
}