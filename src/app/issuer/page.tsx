'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import Spinner from '@/components/Spinner'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { ArrowUpRight, BadgeCheck, ShieldCheck } from 'lucide-react'

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const INITIAL = {
  issuer: '',
  type: '',
  dateOfBirth: '',
  kycTier: '',
  jurisdiction: '',
}

function IssuerView() {
  const { db, activeAddress, issueCredential, pending } = useData()
  const [form, setForm] = useState(INITIAL)
  const [holderAddress, setHolderAddress] = useState(() =>
    db?.identities.holder?.address ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const [issuedId, setIssuedId] = useState<string | null>(null)

  if (!db) return null

  const recent = db.credentials
    .filter((c) => c.issuerAddress === activeAddress)
    .slice(0, 4)

  function handleIssue() {
    setError(null)
    setIssuedId(null)

    const attributes: Record<string, unknown> = {}
    if (form.dateOfBirth) attributes.dateOfBirth = form.dateOfBirth
    if (form.kycTier) {
      const tier = Number(form.kycTier)
      if (tier < 1 || tier > 4) {
        setError('KYC tier must be between 1 and 4.')
        return
      }
      attributes.kycTier = tier
    }
    if (form.jurisdiction)
      attributes.jurisdiction = form.jurisdiction.trim().toUpperCase()

    if (Object.keys(attributes).length === 0) {
      setError('Add at least one attribute to the credential.')
      return
    }

    issueCredential({
      issuer: form.issuer || 'ClearScope Issuer',
      type: form.type || 'Identity Credential',
      attributes,
      holderAddress: holderAddress.trim(),
    }).then(() => {
      setIssuedId('issued')
      setForm(INITIAL)
    })
  }

  return (
    <>
      <PageHeader
        index="01"
        section="issuer"
        title={
          <>
            Issuer <span className="text-gradient">portal</span>
          </>
        }
        description="Sign attributes into credentials held in the holder's private state. Nothing you issue ever appears on chain."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="console-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand" />
            <p className="console-label">issue a credential</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-fail/40 bg-fail/10 px-4 py-3">
              <p className="font-mono text-sm text-fail">{error}</p>
            </div>
          )}
          {issuedId && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-pass/40 bg-pass/10 px-4 py-3">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-pass" />
              <p className="font-mono text-sm text-pass">
                Credential sealed into the holder wallet.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="console-label mb-2">issuer name</p>
              <input
                type="text"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                className="console-input"
                placeholder="Global Identity Corp"
              />
            </div>
            <div>
              <p className="console-label mb-2">credential type</p>
              <input
                type="text"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="console-input"
                placeholder="Government ID"
              />
            </div>

            <div>
              <p className="console-label mb-2">attributes</p>
              <div className="space-y-2">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                  className="console-input"
                  aria-label="Date of birth"
                />
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={form.kycTier}
                  onChange={(e) => setForm({ ...form, kycTier: e.target.value })}
                  className="console-input"
                  placeholder="KYC tier (1 to 4)"
                  aria-label="KYC tier"
                />
                <input
                  type="text"
                  value={form.jurisdiction}
                  onChange={(e) =>
                    setForm({ ...form, jurisdiction: e.target.value })
                  }
                  className="console-input"
                  placeholder="Jurisdiction code (e.g. US)"
                  aria-label="Jurisdiction"
                />
              </div>
              <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
                one or more attributes become policy inputs
              </p>
            </div>

            <div>
              <p className="console-label mb-2">target holder</p>
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
                  placeholder="holder address this credential is for"
                />
              </div>
              <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
                the credential is issued to this specific holder and appears in
                their wallet only
              </p>
            </div>

            <button
              onClick={handleIssue}
              disabled={Boolean(pending.issue) || !holderAddress.trim()}
              className="btn-pill w-full"
            >
              {pending.issue ? (
                <>
                  <Spinner />
                  sealing credential
                </>
              ) : (
                'Issue credential'
              )}
            </button>
          </div>
        </div>

        <div className="console-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="console-label">recent credentials</p>
            <span className="font-mono text-[0.8rem] tracking-[0.2em] text-white/40">
              {String(
                db.credentials.filter((c) => c.issuerAddress === activeAddress)
                  .length,
              ).padStart(2, '0')}{' '}
              issued
            </span>
          </div>

          {recent.length === 0 ? (
            <p className="py-10 text-center font-mono text-sm text-white/35">
              ( nothing issued yet )
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((cred) => (
                <div key={cred.credentialId} className="console-row">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-white">{cred.type}</p>
                      <p className="mt-0.5 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
                        {cred.issuer} ·{' '}
                        {formatDate(new Date(cred.issuedDate).getTime())}
                      </p>
                    </div>
                    <Link
                      href="/holder"
                      className="inline-flex items-center gap-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
                    >
                      wallet
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm leading-relaxed text-white/50">
              Issued credentials are sealed into the holder&apos;s private
              state. The ledger only ever sees request records and pass or fail
              results.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function IssuerPage() {
  return (
    <AppShell>
      <RoleGate required="issuer">
        <IssuerView />
      </RoleGate>
    </AppShell>
  )
}