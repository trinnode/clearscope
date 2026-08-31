'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import MonoText from '@/components/MonoText'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isExpired(expiry: number) {
  return Date.now() > expiry
}

function ResultCopy({ result }: { result: string }) {
  if (result === 'PASS') {
    return (
      <p className="text-sm leading-relaxed text-white/60">
        The holder proved eligibility. A zero knowledge proof was recorded on
        chain with the reference below. No underlying data was revealed.
      </p>
    )
  }
  if (result === 'FAIL') {
    return (
      <p className="text-sm leading-relaxed text-white/60">
        The holder did not satisfy this policy. Only the boolean result was
        shared.
      </p>
    )
  }
  return (
    <p className="text-sm leading-relaxed text-white/60">
      The holder did not hold the attributes required by this policy, so
      eligibility could not be established.
    </p>
  )
}

function VerifierRequestView() {
  const params = useParams()
  const requestId = params.id as string
  const { db } = useData()

  const request = db?.requests.find((r) => r.requestId === requestId)
  const policy = request
    ? db?.policies.find((p) => p.id === request.policyId)
    : undefined

  if (!request || !policy) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-4 font-mono text-[0.8rem] uppercase tracking-[0.25em] text-white/30">
          ( ∅ )
        </p>
        <h1 className="font-display text-3xl font-medium uppercase tracking-tight">
          Request not found
        </h1>
        <Link href="/verifier" className="btn-pill mt-8">
          Back to console
        </Link>
      </div>
    )
  }

  const effectiveStatus = isExpired(request.expiry) ? 'EXPIRED' : request.status

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
        index="03"
        section="verifier"
        title={
          <>
            Request <span className="text-gradient">detail</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="console-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="console-label">{policy.name}</p>
              <StatusBadge status={effectiveStatus} />
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              {policy.questionAsked}
            </p>
          </div>

          {request.result && (
            <div className="animate-fade-up console-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-pass" />
                <p className="console-label">proof on chain</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={request.result} />
                <span className="font-mono text-[0.8rem] tracking-[0.15em] text-white/40">
                  {request.timestamp ? formatDateTime(request.timestamp) : ''}
                </span>
              </div>
              <div className="mt-5">
                <ResultCopy result={request.result} />
              </div>
              {request.proofReference && (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="console-label mb-1.5">proof reference</p>
                  <MonoText copyable>{request.proofReference}</MonoText>
                </div>
              )}
            </div>
          )}

          {!request.result && (
            <div className="console-card p-6">
              <p className="text-sm leading-relaxed text-white/50">
                {effectiveStatus === 'EXPIRED'
                  ? 'This request expired before the holder answered.'
                  : 'Awaiting the holder to generate a proof for this request.'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="console-card p-6">
            <p className="console-label mb-4">request metadata</p>
            <dl className="space-y-4">
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  request id
                </dt>
                <dd>
                  <MonoText copyable>{request.requestId}</MonoText>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  policy
                </dt>
                <dd className="font-mono text-sm text-white/70">
                  {policy.id} · v{request.policyVersion}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  requester address
                </dt>
                <dd>
                  <MonoText copyable>{request.requester}</MonoText>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  target holder
                </dt>
                <dd>
                  <MonoText copyable>{request.holder}</MonoText>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  params hash
                </dt>
                <dd>
                  <MonoText>{request.paramsHash}</MonoText>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  expires
                </dt>
                <dd className="font-mono text-sm text-white/70">
                  {formatDateTime(request.expiry)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  )
}

export default function VerifierRequestPage() {
  return (
    <AppShell>
      <RoleGate required="verifier">
        <VerifierRequestView />
      </RoleGate>
    </AppShell>
  )
}