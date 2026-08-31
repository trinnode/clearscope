'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { truncateAddress } from '@/lib/roles'
import type { Role } from '@/lib/sdk/types'
import {
  BadgeCheck,
  BookOpen,
  GitMerge,
  ShieldCheck,
  Users,
} from 'lucide-react'

const ROLE_ORDER: Array<'issuer' | 'verifier'> = ['issuer', 'verifier']

function GovernanceView() {
  const { db, pending, accreditEntity, updateAccreditation } = useData()
  const [entityName, setEntityName] = useState('')
  const [licenseRef, setLicenseRef] = useState('')
  const [role, setRole] = useState<'issuer' | 'verifier'>('issuer')
  const [address, setAddress] = useState('')
  const [expiryDays, setExpiryDays] = useState(365)

  if (!db) return null

  const accreditations = db.accreditations
  const active = accreditations.filter((a) => a.status === 'ACTIVE')
  const policies = db.policies

const candidates = (ROLE_ORDER as Role[]).map((r) => db.identities[r]).filter(
  (i): i is NonNullable<typeof i> => Boolean(i),
)

  const pickAddress = (r: 'issuer' | 'verifier') => {
    const identity = db.identities[r]
    if (identity) setAddress(identity.address)
  }

  function handleAccredit() {
    if (!entityName.trim() || !licenseRef.trim() || !address.trim()) return
    accreditEntity({
      entityName: entityName.trim(),
      licenseRef: licenseRef.trim(),
      role,
      address: address.trim(),
      expiryMs: expiryDays * 24 * 60 * 60 * 1000,
    }).then(() => {
      setEntityName('')
      setLicenseRef('')
      setAddress('')
    })
  }

  function toggleStatus(id: string, current: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') {
    updateAccreditation(id, {
      status: current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
    })
  }

  return (
    <>
      <PageHeader
        index="04"
        section="governance"
        title={
          <>
            Accreditation <span className="text-gradient">&amp; registry</span>
          </>
        }
        description="The governance authority issues and manages the licenses that let entities act as issuers and verifiers across the network."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="console-card p-5">
          <p className="console-label">active licenses</p>
          <p className="mt-2 font-display text-3xl font-medium text-white">
            {String(active.length).padStart(2, '0')}
          </p>
        </div>
        <div className="console-card p-5">
          <p className="console-label">licensed issuers</p>
          <p className="mt-2 font-display text-3xl font-medium text-brand">
            {String(
              active.filter((a) => a.role === 'issuer').length,
            ).padStart(2, '0')}
          </p>
        </div>
        <div className="console-card p-5">
          <p className="console-label">licensed verifiers</p>
          <p className="mt-2 font-display text-3xl font-medium text-cyan">
            {String(
              active.filter((a) => a.role === 'verifier').length,
            ).padStart(2, '0')}
          </p>
        </div>
        <div className="console-card p-5">
          <p className="console-label">registered policies</p>
          <p className="mt-2 font-display text-3xl font-medium text-pass">
            {String(policies.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="console-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <p className="console-label">accredit an entity</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="console-label mb-2 block">entity name</label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="console-input"
                placeholder="e.g. Global Identity Corp"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="console-label mb-2 block">license ref</label>
                <input
                  type="text"
                  value={licenseRef}
                  onChange={(e) => setLicenseRef(e.target.value)}
                  className="console-input font-code"
                  placeholder="LIC-2026-0003"
                />
              </div>
              <div>
                <label className="console-label mb-2 block">expiry</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="console-input"
                >
                  {[90, 180, 365, 730].map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="console-label mb-2 block">role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_ORDER.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r)
                      pickAddress(r)
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      role === r
                        ? 'border-brand/60 bg-brand/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    <p className="font-display text-sm font-medium uppercase tracking-tight text-white">
                      {r}
                    </p>
                    <p className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/35">
                      {r === 'issuer' ? 'mints credentials' : 'verifies proofs'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="console-label mb-2 block">bound identity</label>
              <div className="flex flex-wrap items-center gap-2">
                {candidates.map((identity) => (
                  <button
                    key={identity.address}
                    type="button"
                    onClick={() => setAddress(identity.address)}
                    className={`rounded-full border px-3 py-1.5 font-code text-sm transition-colors cursor-pointer ${
                      address === identity.address
                        ? 'border-brand/60 bg-brand/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25'
                    }`}
                  >
                    {truncateAddress(identity.address)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="console-input mt-2 font-code"
                placeholder="identity address this license is bound to"
              />
            </div>

            <button
              onClick={handleAccredit}
              disabled={
                Boolean(pending.accredit) ||
                !entityName.trim() ||
                !licenseRef.trim() ||
                !address.trim()
              }
              className="btn-pill w-full"
            >
              {pending.accredit ? 'Accrediting…' : 'Issue license'}
            </button>
          </div>
        </div>

        <div className="console-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            <p className="console-label">license registry</p>
          </div>

          {accreditations.length === 0 ? (
            <p className="text-sm leading-relaxed text-white/50">
              No licenses have been issued yet. Accredit an entity to let it
              act on the network.
            </p>
          ) : (
            <div className="space-y-3">
              {accreditations.map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-brand" />
                        <p className="font-display text-base font-medium uppercase tracking-tight text-white">
                          {acc.entityName}
                        </p>
                        <span
                          className={`console-chip ${
                            acc.status === 'ACTIVE'
                              ? 'console-chip-pass'
                              : acc.status === 'SUSPENDED'
                                ? 'console-chip-pending'
                                : 'console-chip-fail'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </div>
                      <p className="mt-1.5 font-code text-sm text-white/45">
                        {acc.licenseRef} · {truncateAddress(acc.address)}
                      </p>
                      <p className="mt-1 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30">
                        {acc.role} · issued{' '}
                        {new Date(acc.issuedAt).toLocaleDateString()} · expires{' '}
                        {new Date(acc.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(acc.id, acc.status)}
                        className="btn-pill-ghost px-3 py-1.5 text-sm"
                      >
                        {acc.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                      {acc.status !== 'REVOKED' && (
                        <button
                          onClick={() =>
                            updateAccreditation(acc.id, { status: 'REVOKED' })
                          }
                          className="btn-pill-ghost px-3 py-1.5 text-sm text-fail"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/governance/policies"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-brand/40"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand" />
                <p className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/70">
                  policy registry
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                The public, read only source of truth for every disclosure
                policy.
              </p>
            </Link>
            <Link
              href="/governance/policies/compose"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-brand/40"
            >
              <div className="flex items-center gap-2">
                <GitMerge className="h-4 w-4 text-accent" />
                <p className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/70">
                  compose policy
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                Combine base policies into new composite disclosure rules.
              </p>
            </Link>
          </div>
        </div>
      </div>

      <div className="console-card mt-6 p-6">
        <p className="console-label mb-3">how licensing works</p>
        <p className="max-w-3xl text-sm leading-relaxed text-white/50">
          Only the governance authority can issue a license, and a license is
          always bound to a specific identity address. Issuers and verifiers are
          organizations; holders are individuals and need no license. A license
          can be suspended or revoked at any time, and it always expires. Every
          action an issuer or verifier takes is checked against this registry on
          the server before it is allowed.
        </p>
      </div>
    </>
  )
}

export default function GovernancePage() {
  return (
    <AppShell>
      <RoleGate required="system">
        <GovernanceView />
      </RoleGate>
    </AppShell>
  )
}