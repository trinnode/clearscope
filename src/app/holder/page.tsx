'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import MonoText from '@/components/MonoText'
import Spinner from '@/components/Spinner'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import type { NetworkStatus } from '@/lib/sdk/types'
import { ArrowUpRight, Eye, EyeOff, ShieldCheck, Wifi, WifiOff } from 'lucide-react'

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isExpired(expiry: number) {
  return Date.now() > expiry
}

function NetworkPill() {
  const [status, setStatus] = useState<NetworkStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/network', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (active) setStatus(json as NetworkStatus)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <span className="console-chip-neutral">
        <Spinner className="h-2.5 w-2.5" />
        checking network
      </span>
    )
  }

  const online = status ? status.node && status.indexer : false

  return (
    <span className={online ? 'console-chip-pass' : 'console-chip-neutral'}>
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? 'network online' : 'network idle'}
    </span>
  )
}

function WalletView() {
  const {
    db,
    activeAddress,
    deleteIdentity,
    getSessionSeed,
    loginIdentity,
    pending,
  } = useData()
  const [seed, setSeed] = useState<string | null>(() => getSessionSeed('holder'))
  const [seedEntry, setSeedEntry] = useState('')
  const [revealing, setRevealing] = useState(false)

  if (!db) return null

  const credentials = db.credentials.filter((c) => c.holder === activeAddress)
  const pendingRequests = db.requests.filter(
    (r) =>
      r.holder === activeAddress && r.status === 'PENDING' && !isExpired(r.expiry),
  )
  const getPolicyName = (policyId: string) =>
    db.policies.find((p) => p.id === policyId)?.name ?? policyId

  async function handleReveal() {
    if (seed) {
      setRevealing((v) => !v)
      return
    }
    await loginIdentity('holder', seedEntry.trim())
    setSeed(getSessionSeed('holder'))
    setSeedEntry('')
    setRevealing(true)
  }

  return (
    <>
      <PageHeader
        index="01"
        section="holder"
        title={
          <>
            Identity <span className="text-gradient">wallet</span>
          </>
        }
        description="Credentials held in private state. Every request is answered with a proof, never your underlying data."
        actions={
          <>
            <NetworkPill />
            <button
              onClick={() => deleteIdentity('holder')}
              disabled={Boolean(pending['identity-holder'])}
              className="btn-pill-ghost"
            >
              {pending['identity-holder'] ? <Spinner /> : 'Disconnect'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="console-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="console-label">credentials</p>
              <span className="font-mono text-[0.8rem] tracking-[0.2em] text-white/40">
                {String(credentials.length).padStart(2, '0')} held
              </span>
            </div>

            {credentials.length === 0 ? (
              <EmptyState
                marker="( no credentials )"
                title="Empty wallet"
                description="Ask an issuer to send you a credential, or issue one yourself from the issuer portal."
              />
            ) : (
              <div className="space-y-3">
                {credentials.map((cred) => (
                  <div
                    key={cred.credentialId}
                    className="console-row group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/30 bg-brand/10">
                          <ShieldCheck className="h-4 w-4 text-brand" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-white">{cred.type}</p>
                          <p className="mt-0.5 font-mono text-[0.8rem] uppercase tracking-[0.15em] text-white/40">
                            {cred.issuer}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[0.8rem] tracking-[0.15em] text-white/30">
                        issued {formatDate(new Date(cred.issuedDate).getTime())}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(cred.attributes).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-code text-[0.75rem] text-white/60"
                        >
                          {key.replace(/([A-Z])/g, '_$1').toLowerCase()}
                          <span className="ml-1 text-white/25">· {String(value)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="console-card p-6">
            <p className="console-label mb-4">identity address</p>
            <MonoText copyable>{activeAddress}</MonoText>
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.8rem] uppercase tracking-[0.15em] text-white/40">
                  credentials
                </span>
                <span className="font-display text-lg text-white">
                  {String(credentials.length).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[0.8rem] uppercase tracking-[0.15em] text-white/40">
                  pending
                </span>
                <span className="font-display text-lg text-white">
                  {String(pendingRequests.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              {!seed ? (
                <>
                  <p className="mb-2 font-mono text-[0.8rem] uppercase tracking-[0.15em] text-white/40">
                    reveal seed phrase
                  </p>
                  <textarea
                    value={seedEntry}
                    onChange={(e) => setSeedEntry(e.target.value)}
                    rows={2}
                    placeholder="Enter the holder seed phrase to unlock"
                    className="console-input w-full resize-none font-code text-[0.8rem]"
                  />
                  <button
                    onClick={handleReveal}
                    disabled={!seedEntry.trim() || Boolean(pending['login-holder'])}
                    className="btn-pill-ghost mt-2 w-full"
                  >
                    {pending['login-holder'] ? <Spinner /> : <Eye className="h-3.5 w-3.5" />}
                    Unlock seed
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[0.8rem] uppercase tracking-[0.15em] text-white/40">
                      {revealing ? 'seed phrase' : 'seed phrase ( hidden )'}
                    </p>
                    <button
                      onClick={() => setRevealing((v) => !v)}
                      className="btn-icon"
                      aria-label="Toggle seed visibility"
                    >
                      {revealing ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {revealing && (
                    <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      {seed.split(' ').map((word, i) => (
                        <span key={i} className="truncate font-code text-[0.8rem] text-white/70">
                          <span className="text-white/25">{i + 1}.</span> {word}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="console-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="console-label">pending requests</p>
              <span className="font-mono text-[0.8rem] tracking-[0.2em] text-white/40">
                {String(pendingRequests.length).padStart(2, '0')}
              </span>
            </div>
            {pendingRequests.length === 0 ? (
              <p className="font-mono text-sm leading-relaxed text-white/35">
                ( none awaiting your approval )
              </p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <Link
                    key={req.requestId}
                    href={`/holder/request/${req.requestId}`}
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div>
                      <p className="font-mono text-sm text-white">
                        {req.requesterName}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/35">
                        {getPolicyName(req.policyId)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-white" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function HolderPage() {
  return (
    <AppShell>
      <RoleGate required="holder">
        <WalletView />
      </RoleGate>
    </AppShell>
  )
}
