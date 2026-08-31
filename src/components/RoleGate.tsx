'use client'

import Link from 'next/link'
import { useData } from '@/data/provider'
import type { Role } from '@/lib/sdk/types'
import { ROLE_META } from '@/lib/roles'
import { ArrowRight, BadgeCheck, Lock } from 'lucide-react'

export default function RoleGate({
  required,
  children,
}: {
  required: Role
  children: React.ReactNode
}) {
  const { activeRole, db, setActiveRole, signedIn, accredited } = useData()

  const identityExists = Boolean(db?.identities[required])

  if (
    activeRole === required &&
    identityExists &&
    (required === 'holder' || required === 'system' || accredited)
  ) {
    return <>{children}</>
  }

  // The right persona is signed in but holds no live license for its role.
  if (activeRole === required && identityExists && !accredited) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="console-card flex flex-col items-center p-10 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-pending/40 bg-pending/10">
            <BadgeCheck className="h-6 w-6 text-pending" />
          </div>
          <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-pending">
            [ pending accreditation ]
          </p>
          <h1 className="mt-4 font-display text-3xl font-medium uppercase leading-[0.95] tracking-tight">
            {ROLE_META[required].label} license required
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
            This portal is restricted to accredited{' '}
            <span className="text-white">{ROLE_META[required].label}s</span>.
            Your identity does not currently hold an active license for this
            role. Only the governance authority can grant one.
          </p>
          <Link
            href="/governance"
            className="btn-pill mt-8"
          >
            View accreditation registry
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const createdRoles = (Object.keys(db?.identities ?? {}) as Role[]).filter(
    (role) => db?.identities[role],
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="console-card flex flex-col items-center p-10 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
          <Lock className="h-6 w-6 text-accent" />
        </div>
        <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-accent">
          [ restricted area ]
        </p>
        <h1 className="mt-4 font-display text-3xl font-medium uppercase leading-[0.95] tracking-tight">
          {ROLE_META[required].label} portal
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/50">
          This section is gated to the{' '}
          <span className="text-white">{ROLE_META[required].label}</span>{' '}
          identity. You are currently signed in as{' '}
          <span className="text-white">
            {activeRole ? ROLE_META[activeRole].label : 'no one'}
          </span>
          . Switch to the right persona to continue.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {createdRoles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              disabled={Boolean(signedIn[role]) === false}
              title={
                signedIn[role]
                  ? `Switch to ${ROLE_META[role].label}`
                  : 'Sign in to this identity first'
              }
              className={signedIn[role] ? 'btn-pill-ghost' : 'btn-pill-ghost opacity-40'}
            >
              Switch to {ROLE_META[role].label}
              {signedIn[role] ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>

        <Link
          href="/identity"
          className="btn-pill mt-6"
        >
          Manage identities
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}