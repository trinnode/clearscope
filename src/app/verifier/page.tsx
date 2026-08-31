'use client'

import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'
import { ArrowUpRight, Plus } from 'lucide-react'

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function isExpired(expiry: number) {
  return Date.now() > expiry
}

function VerifierView() {
  const { db, activeAddress } = useData()
  if (!db) return null

  const requests = db.requests.filter((r) => r.requester === activeAddress)
  const getPolicyName = (policyId: string) =>
    db.policies.find((p) => p.id === policyId)?.name ?? policyId

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING' && !isExpired(r.expiry))
      .length,
    responded: requests.filter((r) => r.status === 'RESPONDED').length,
    expired: requests.filter((r) => r.status === 'EXPIRED' || isExpired(r.expiry))
      .length,
  }

  const statCards = [
    { label: 'total requests', value: stats.total },
    { label: 'awaiting proof', value: stats.pending },
    { label: 'responded', value: stats.responded },
    { label: 'expired', value: stats.expired },
  ]

  return (
    <>
      <PageHeader
        index="01"
        section="verifier"
        title={
          <>
            Verification <span className="text-gradient">console</span>
          </>
        }
        description="Create scoped disclosure requests, share them with holders, and collect boolean proofs on chain."
        actions={
          <Link href="/verifier/new" className="btn-pill">
            <Plus className="h-4 w-4" />
            New request
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-up console-card p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/35">
              {card.label}
            </p>
            <p className="mt-3 font-display text-3xl font-medium text-white">
              {String(card.value).padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      <div className="console-card overflow-hidden">
        {requests.length === 0 ? (
          <EmptyState
            marker="( no requests )"
            title="No verification requests"
            description="Create your first scoped request to begin collecting proofs."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Policy', 'Holder', 'Status', 'Created', 'Expires', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 pb-3 pt-4 text-left font-mono text-[0.75rem] font-normal uppercase tracking-[0.2em] text-white/35"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((req) => {
                  const effectiveStatus = isExpired(req.expiry)
                    ? 'EXPIRED'
                    : req.status
                  return (
                    <tr
                      key={req.requestId}
                      className="group transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/verifier/request/${req.requestId}`}
                          className="inline-flex items-center gap-1.5 font-mono text-sm text-brand transition-colors hover:text-white"
                        >
                          {getPolicyName(req.policyId)}
                          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                        <p className="mt-0.5 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/30">
                          {req.requesterName}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-code text-sm text-white/50">
                        {truncateAddress(req.holder)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={effectiveStatus} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-white/50">
                        {formatDate(req.timestamp ?? req.expiry - 86400000)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-white/50">
                        {formatDate(req.expiry)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/verifier/request/${req.requestId}`}
                          className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
                        >
                          open
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default function VerifierPage() {
  return (
    <AppShell>
      <RoleGate required="verifier">
        <VerifierView />
      </RoleGate>
    </AppShell>
  )
}