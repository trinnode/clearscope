'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import MonoText from '@/components/MonoText'
import Spinner from '@/components/Spinner'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { ArrowLeft, Check, GitMerge, Copy } from 'lucide-react'
import type { RequestParams } from '@/lib/sdk/types'

function NewRequestView() {
  const { db, createRequest, pending } = useData()
  const [policyId, setPolicyId] = useState<string | null>(null)
  const [ageThreshold, setAgeThreshold] = useState(18)
  const [kycTier, setKycTier] = useState(2)
  const [excluded, setExcluded] = useState('US,IR,KP')
  const [expiryDays, setExpiryDays] = useState(7)
  const [holderAddress, setHolderAddress] = useState(() =>
    db?.identities.holder?.address ?? '',
  )
  const [created, setCreated] = useState<{
    requestId: string
    requestLink: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  if (!db) return null

  const policies = db.policies

  function buildParams(): RequestParams {
    switch (policyId) {
      case 'age-threshold-v1':
        return { ageThreshold }
      case 'kyc-tier-v1':
        return { kycTier }
      case 'jurisdiction-exclusion-v1':
        return {
          excludedJurisdictions: excluded
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean),
        }
      default:
        return {}
    }
  }

  async function handleCreate() {
    if (!policyId) return
    const request = await createRequest({
      policyId,
      requesterName: 'ClearScope Console',
      expiryMs: expiryDays * 24 * 60 * 60 * 1000,
      params: buildParams(),
      holderAddress: holderAddress.trim(),
    })
    if (request) {
      setCreated({
        requestId: request.requestId,
        requestLink: `${window.location.origin}/holder/request/${request.requestId}`,
      })
    }
  }

  if (created) {
    return (
      <>
        <div className="mb-6">
          <Link
            href="/verifier"
            className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            back to console
          </Link>
        </div>

        <div className="animate-fade-up mx-auto max-w-lg">
          <div className="console-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-pass/40 bg-pass/10">
                <Check className="h-5 w-5 text-pass" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-medium uppercase tracking-tight">
                  Request created
                </h1>
                <p className="mt-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/40">
                  share this link with the holder
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="console-label mb-1.5">request id</p>
                <p className="font-code text-sm text-white/80">
                  {created.requestId}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="console-label mb-1.5">request link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={created.requestLink}
                    readOnly
                    className="console-input flex-1"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(created.requestLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                    className="btn-icon"
                    aria-label="Copy request link"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-pass" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/verifier" className="btn-pill">
                View console
              </Link>
              <button
                onClick={() => {
                  setCreated(null)
                  setPolicyId(null)
                }}
                className="btn-pill-ghost"
              >
                Create another
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/verifier"
          className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          back to console
        </Link>
      </div>

      <PageHeader
        index="02"
        section="verifier"
        title={
          <>
            New verification <span className="text-gradient">request</span>
          </>
        }
        description="Choose a disclosure policy, set its parameters, and share the request link with a holder."
      />

      <div className="max-w-2xl space-y-6">
        <div>
          <p className="console-label mb-3">disclosure policy</p>
          <div className="space-y-2">
            {policies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => setPolicyId(policy.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 cursor-pointer ${
                  policyId === policy.id
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
                <span className="flex items-center gap-2">
                  {policy.composition && (
                    <span className="inline-flex items-center gap-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-brand">
                      <GitMerge className="h-3 w-3" />
                      {policy.composition.operator}
                    </span>
                  )}
                  <span className="font-code text-[0.75rem] text-white/30">
                    v{policy.version}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {policyId === 'age-threshold-v1' && (
          <div className="animate-fade-up">
            <p className="console-label mb-3">age threshold</p>
            <input
              type="number"
              min={0}
              max={150}
              value={ageThreshold}
              onChange={(e) => setAgeThreshold(Number(e.target.value))}
              className="console-input max-w-[220px]"
            />
            <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
              holder must be older than this value
            </p>
          </div>
        )}

        {policyId === 'kyc-tier-v1' && (
          <div className="animate-fade-up">
            <p className="console-label mb-3">minimum kyc tier</p>
            <select
              value={kycTier}
              onChange={(e) => setKycTier(Number(e.target.value))}
              className="console-input max-w-[220px]"
            >
              <option value={1}>Tier 1 or above</option>
              <option value={2}>Tier 2 or above</option>
              <option value={3}>Tier 3 or above</option>
              <option value={4}>Tier 4 only</option>
            </select>
          </div>
        )}

        {policyId === 'jurisdiction-exclusion-v1' && (
          <div className="animate-fade-up">
            <p className="console-label mb-3">excluded jurisdictions</p>
            <input
              type="text"
              value={excluded}
              onChange={(e) => setExcluded(e.target.value)}
              className="console-input max-w-[320px]"
              placeholder="US,IR,KP"
            />
            <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
              comma separated iso codes
            </p>
          </div>
        )}

        <div>
          <p className="console-label mb-3">request expiry</p>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="console-input max-w-[220px]"
          >
            {[1, 3, 7, 14, 30].map((days) => (
              <option key={days} value={days}>
                {days} day{days > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="console-label mb-3">target holder</p>
          <div className="flex flex-wrap items-center gap-2">
            {db.identities.holder && (
              <button
                type="button"
                onClick={() => setHolderAddress(db.identities.holder!.address)}
                className={`rounded-full border px-3 py-1.5 font-code text-sm transition-colors cursor-pointer ${
                  holderAddress === db.identities.holder.address
                    ? 'border-brand/60 bg-brand/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25'
                }`}
              >
                {db.identities.holder.address.slice(0, 10)}...
              </button>
            )}
            <input
              type="text"
              value={holderAddress}
              onChange={(e) => setHolderAddress(e.target.value)}
              className="console-input min-w-[260px] flex-1 font-code"
              placeholder="holder address this request is for"
            />
          </div>
          <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
            the request is addressed to this specific holder and appears in
            their wallet
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={!policyId || !holderAddress.trim() || Boolean(pending.request)}
          className="btn-pill px-8 py-3"
        >
          {pending.request ? (
            <>
              <Spinner />
              creating request
            </>
          ) : (
            'Create request'
          )}
        </button>
      </div>
    </>
  )
}

export default function NewRequestPage() {
  return (
    <AppShell>
      <RoleGate required="verifier">
        <NewRequestView />
      </RoleGate>
    </AppShell>
  )
}