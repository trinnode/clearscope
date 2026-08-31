'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import MonoText from '@/components/MonoText'
import Spinner from '@/components/Spinner'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import {
  ArrowLeft,
  ArrowRight,
  Fingerprint,
  ShieldCheck,
  Clock,
} from 'lucide-react'

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

function ResultCopy({
  result,
  policyName,
}: {
  result: 'PASS' | 'FAIL' | 'INSUFFICIENT_SCOPE'
  policyName: string
}) {
  if (result === 'PASS') {
    return (
      <p className="text-sm leading-relaxed text-white/60">
        Eligibility confirmed for {policyName}. A zero knowledge proof was
        generated and the result was recorded on chain. No underlying data was
        shared.
      </p>
    )
  }
  if (result === 'FAIL') {
    return (
      <p className="text-sm leading-relaxed text-white/60">
        The credential does not satisfy {policyName}, so eligibility was
        declined. Only the boolean result was shared.
      </p>
    )
  }
  return (
    <p className="text-sm leading-relaxed text-white/60">
      The credential does not carry the attributes required by {policyName}.
      Eligibility could not be established.
    </p>
  )
}

function RequestDetailView() {
  const params = useParams()
  const requestId = params.id as string

  const { db, activeAddress, respondToRequest, pending } = useData()
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const request = db?.requests.find((r) => r.requestId === requestId)
  const policy = request
    ? db?.policies.find((p) => p.id === request.policyId)
    : undefined

  if (request && request.holder !== activeAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.25em] text-white/30">
          ( ∅ )
        </p>
        <h1 className="font-display text-3xl font-medium uppercase tracking-tight">
          Not addressed to you
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
          This request is targeted at a different holder. It does not appear in
          your wallet.
        </p>
        <Link href="/holder" className="btn-pill mt-8">
          Back to wallet
        </Link>
      </div>
    )
  }

  const expired = request ? isExpired(request.expiry) : false
  const showResponse = answered || request?.status === 'RESPONDED'
  const active = request?.status === 'PENDING' && !expired

  const paramSummary = useMemo(() => {
    if (!request?.params) return null
    const parts: string[] = []
    if (request.params.ageThreshold !== undefined)
      parts.push(`age > ${request.params.ageThreshold}`)
    if (request.params.kycTier !== undefined)
      parts.push(`kyc tier >= ${request.params.kycTier}`)
    if (request.params.excludedJurisdictions?.length)
      parts.push(`outside ${request.params.excludedJurisdictions.join(', ')}`)
    return parts.length ? parts.join(' and ') : null
  }, [request])

  if (!request || !policy) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-white/30 mb-4">
          ( ∅ )
        </p>
        <h1 className="font-display text-3xl font-medium uppercase tracking-tight">
          Request not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
          This request may have expired or the link is incorrect.
        </p>
        <Link href="/holder" className="btn-pill mt-8">
          Back to wallet
        </Link>
      </div>
    )
  }

  async function handleRespond() {
    if (!selected) return
    await respondToRequest(requestId, selected)
    setAnswered(true)
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/holder"
          className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          back to wallet
        </Link>
      </div>

      <PageHeader
        index="02"
        section="holder"
        title={
          <>
            Verification <span className="text-gradient">request</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="console-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="console-label">{policy.name}</p>
              <StatusBadge status={showResponse ? (request.result ?? 'RESPONDED') : expired ? 'EXPIRED' : 'PENDING'} />
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              {policy.questionAsked}
            </p>
            {paramSummary && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="console-label mb-1.5">required parameters</p>
                <p className="font-code text-sm text-brand">{paramSummary}</p>
              </div>
            )}
          </div>

          {active && (
            <div className="console-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-brand" />
                <p className="console-label">respond with a proof</p>
              </div>
              <p className="text-sm leading-relaxed text-white/50">
                Select the credential that answers this policy. ClearScope will
                generate a zero knowledge proof and share only the boolean
                result.
              </p>

              <div className="mt-5 space-y-2">
                {db?.credentials.map((cred) => (
                  <button
                    key={cred.credentialId}
                    onClick={() => setSelected(cred.credentialId)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors duration-200 cursor-pointer ${
                      selected === cred.credentialId
                        ? 'border-brand/60 bg-brand/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    <div>
                      <p className="font-mono text-sm text-white">{cred.type}</p>
                      <p className="mt-0.5 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
                        {cred.issuer}
                      </p>
                    </div>
                    <span
                      className={`h-3.5 w-3.5 rounded-full border ${
                        selected === cred.credentialId
                          ? 'border-brand bg-brand'
                          : 'border-white/25'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleRespond}
                disabled={!selected || Boolean(pending.respond)}
                className="btn-pill mt-6 px-8 py-3"
              >
                {pending.respond ? (
                  <>
                    <Spinner />
                    generating proof
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Generate proof
                  </>
                )}
              </button>
            </div>
          )}

          {showResponse && request.result && (
            <div className="animate-fade-up console-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-pass" />
                <p className="console-label">proof generated</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={request.result} />
                <span className="font-mono text-[0.8rem] tracking-[0.15em] text-white/40">
                  recorded {request.timestamp ? formatDateTime(request.timestamp) : ''}
                </span>
              </div>
              <div className="mt-5">
                <ResultCopy result={request.result} policyName={policy.name} />
              </div>
              {request.proofReference && (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="console-label mb-1.5">proof reference</p>
                  <MonoText copyable>{request.proofReference}</MonoText>
                </div>
              )}
            </div>
          )}

          {expired && !showResponse && (
            <div className="console-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/40" />
                <p className="console-label">request expired</p>
              </div>
              <p className="text-sm leading-relaxed text-white/50">
                This request was not answered before it expired. No data was
                shared.
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
                  requester
                </dt>
                <dd className="font-mono text-sm text-white/70">
                  {request.requesterName}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                  address
                </dt>
                <dd>
                  <MonoText copyable>{request.requester}</MonoText>
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

          <div className="console-card p-6">
            <p className="console-label mb-3">what is shared</p>
            <p className="text-sm leading-relaxed text-white/50">
              The verifier receives a boolean result and a proof reference.
              Never your date of birth, tier, jurisdiction, or any other
              attribute.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function HolderRequestPage() {
  return (
    <AppShell>
      <RoleGate required="holder">
        <RequestDetailView />
      </RoleGate>
    </AppShell>
  )
}
