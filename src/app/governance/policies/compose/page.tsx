'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import Spinner from '@/components/Spinner'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { ArrowLeft, Check, CheckCircle2, GitBranch, GitMerge } from 'lucide-react'
import type { Policy } from '@/lib/sdk/types'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function ComposeView() {
  const { db, composePolicy, pending } = useData()
  const [name, setName] = useState('')
  const [operator, setOperator] = useState<'AND' | 'OR'>('AND')
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  if (!db) return null

  const basePolicies = db.policies.filter((p) => !p.composition)
  const policies = db.policies

  function togglePolicy(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  function handleCompose() {
    setError(null)
    setCreatedId(null)

    const id = slugify(name)
    if (!name || !id) {
      setError('Give the composed policy a name.')
      return
    }
    if (selected.length < 2) {
      setError('Select at least two base policies to combine.')
      return
    }
    if (policies.some((p) => p.id === id)) {
      setError('A policy with this id already exists.')
      return
    }

    const description =
      operator === 'AND'
        ? `Holder must pass all of: ${selected
            .map((sid) => basePolicies.find((p) => p.id === sid)?.name ?? sid)
            .join(', ')}.`
        : `Holder must pass at least one of: ${selected
            .map((sid) => basePolicies.find((p) => p.id === sid)?.name ?? sid)
            .join(', ')}.`

    const policy: Policy = {
      id,
      name: name.trim(),
      version: '1.0.0',
      description,
      questionAsked: `Does the holder satisfy the combined ${operator} check?`,
      privateInput: 'Underlying attributes of each component',
      publicOutput: 'boolean',
      compactSource: 'composed',
      composition: { operator, components: selected },
    }

    composePolicy(policy).then(() => {
      setCreatedId(policy.id)
      setName('')
      setSelected([])
    })
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/governance/policies"
          className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          back to registry
        </Link>
      </div>

      <PageHeader
        index="02"
        section="system"
        title={
          <>
            Compose a <span className="text-gradient">policy</span>
          </>
        }
        description="Combine base policies with AND or OR logic into a reusable, verifiable rule."
      />

      {createdId && (
        <div className="animate-fade-up mb-6 flex items-center gap-2 rounded-xl border border-pass/40 bg-pass/10 px-4 py-3">
          <Check className="h-4 w-4 flex-shrink-0 text-pass" />
          <p className="font-mono text-sm text-pass">
            Policy registered. View it in the registry.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-fail/40 bg-fail/10 px-4 py-3">
          <p className="font-mono text-sm text-fail">{error}</p>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        <div className="console-card p-6">
          <p className="console-label mb-2">policy name</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="console-input"
            placeholder="e.g. Regulated Adult KYC"
          />
          {name && (
            <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
              policy id: <span className="text-brand">{slugify(name)}</span>
            </p>
          )}
        </div>

        <div className="console-card p-6">
          <p className="console-label mb-3">logic</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOperator('AND')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-mono text-sm uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer ${
                operator === 'AND'
                  ? 'border-brand/60 bg-brand/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25'
              }`}
            >
              <GitMerge className="h-4 w-4 text-brand" />
              AND
            </button>
            <button
              onClick={() => setOperator('OR')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-mono text-sm uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer ${
                operator === 'OR'
                  ? 'border-brand/60 bg-brand/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25'
              }`}
            >
              <GitBranch className="h-4 w-4 text-brand" />
              OR
            </button>
          </div>
          <p className="mt-3 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
            {operator === 'AND'
              ? 'holder must pass every selected policy'
              : 'holder must pass at least one selected policy'}
          </p>
        </div>

        <div className="console-card p-6">
          <p className="console-label mb-3">base policies</p>
          <div className="space-y-2">
            {basePolicies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => togglePolicy(policy.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors duration-200 cursor-pointer ${
                  selected.includes(policy.id)
                    ? 'border-brand/60 bg-brand/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <div>
                  <p className="font-mono text-sm text-white">{policy.name}</p>
                  <p className="mt-0.5 font-mono text-[0.8rem] uppercase tracking-[0.15em] text-white/40">
                    {policy.questionAsked}
                  </p>
                </div>
                {selected.includes(policy.id) && (
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCompose}
          disabled={Boolean(pending.compose)}
          className="btn-pill px-8 py-3"
        >
          {pending.compose ? (
            <>
              <Spinner />
              registering policy
            </>
          ) : (
            'Register composed policy'
          )}
        </button>
      </div>
    </>
  )
}

export default function ComposePolicyPage() {
  return (
    <AppShell>
      <RoleGate required="system">
        <ComposeView />
      </RoleGate>
    </AppShell>
  )
}