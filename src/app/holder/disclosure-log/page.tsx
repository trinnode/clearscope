'use client'

import AppShell from '@/components/AppShell'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import MonoText from '@/components/MonoText'
import RoleGate from '@/components/RoleGate'
import { useData } from '@/data/provider'

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DisclosureLogView() {
  const { db, activeAddress } = useData()
  if (!db) return null

  const entries = db.auditLog
    .filter((entry) => {
      if (entry.role !== 'holder') return false
      const request = db.requests.find((r) => r.requestId === entry.requestId)
      return request ? request.holder === activeAddress : false
    })
    .sort((a, b) => b.timestamp - a.timestamp)
  const getPolicyName = (policyId: string) =>
    db.policies.find((p) => p.id === policyId)?.name ?? policyId

  return (
    <>
      <PageHeader
        index="02"
        section="holder"
        title={
          <>
            Disclosure <span className="text-gradient">log</span>
          </>
        }
        description="A full record of every request you answered, the result you shared, and the proof reference on chain."
      />

      <div className="console-card overflow-hidden">
        {entries.length === 0 ? (
          <EmptyState
            marker="( no disclosures )"
            title="Nothing disclosed yet"
            description="When you respond to a verification request, the record will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Date', 'Requester', 'Policy', 'Result', 'Proof reference'].map(
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
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-white/60">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-white">
                      {entry.requesterName}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-white/60">
                      {getPolicyName(entry.policyId)} · v{entry.policyVersion}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={entry.result} />
                    </td>
                    <td className="max-w-[220px] px-5 py-4">
                      <MonoText copyable>{entry.proofReference}</MonoText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default function DisclosureLogPage() {
  return (
    <AppShell>
      <RoleGate required="holder">
        <DisclosureLogView />
      </RoleGate>
    </AppShell>
  )
}
