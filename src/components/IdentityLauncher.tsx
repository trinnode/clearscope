'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useData } from '@/data/provider'
import type { Role } from '@/lib/sdk/types'
import { ROLE_META, truncateAddress } from '@/lib/roles'
import { DEMO_ADDRESSES, DEMO_SEEDS, isDemoIdentity } from '@/lib/demo'
import Logo from './Logo'
import IdentityWizard from './IdentityWizard'
import Spinner from './Spinner'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  LayoutDashboard,
  KeyRound,
  Wallet,
} from 'lucide-react'

const ROLE_ICONS: Record<Role, typeof Wallet> = {
  holder: Wallet,
  verifier: LayoutDashboard,
  issuer: BadgeCheck,
  system: BookOpen,
}

const ROLE_ACCENT: Record<Role, string> = {
  holder: 'text-brand',
  verifier: 'text-cyan',
  issuer: 'text-pass',
  system: 'text-accent',
}

const ROLE_ORDER: Role[] = ['holder', 'verifier', 'issuer', 'system']

export default function IdentityLauncher({
  onEnter,
  back = false,
}: {
  onEnter?: (role: Role) => void
  back?: boolean
}) {
  const { db, loading, signedIn, pending, loginIdentity, setActiveRole } = useData()
  const [wizardRole, setWizardRole] = useState<Role | null>(null)
  const [signInRole, setSignInRole] = useState<Role | null>(null)
  const [seedInput, setSeedInput] = useState('')

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-0 text-white">
        <Logo markOnly markClassName="w-10 h-10 text-brand mb-8" />
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-console-dot rounded-full bg-brand" />
          <span
            className="h-1.5 w-1.5 animate-console-dot rounded-full bg-brand"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="h-1.5 w-1.5 animate-console-dot rounded-full bg-brand"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
        <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.25em] text-white/40">
          connecting console
        </p>
      </div>
    )
  }

  if (wizardRole) {
    return (
      <IdentityWizard
        role={wizardRole}
        onComplete={() => {
          const role = wizardRole
          setWizardRole(null)
          onEnter?.(role)
        }}
      />
    )
  }

  const enter = (role: Role) => {
    setActiveRole(role)
    onEnter?.(role)
  }

  async function handleSignIn(role: Role) {
    await loginIdentity(role, seedInput.trim())
    setSeedInput('')
    setSignInRole(null)
    enter(role)
  }

  async function handleDemoSignIn(role: Role) {
    await loginIdentity(role, DEMO_SEEDS[role])
    enter(role)
  }

  return (
    <div className="relative min-h-screen bg-surface-0 px-6 py-10 text-white sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(125,211,252,0.10),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-4xl">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5"
            aria-label="ClearScope home"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5 text-brand"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.5" />
              <circle cx="12" cy="12" r="2.25" />
              <line x1="12" y1="0.5" x2="12" y2="3.5" />
              <line x1="12" y1="20.5" x2="12" y2="23.5" />
              <line x1="0.5" y1="12" x2="3.5" y2="12" />
              <line x1="20.5" y1="12" x2="23.5" y2="12" />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="font-mono text-sm tracking-[0.25em] text-white transition-colors group-hover:text-white/70">
                ( CLEARSCOPE )
              </span>
              <span className="mt-1 font-mono text-[0.8rem] tracking-[0.25em] text-white/30">
                [ identity console ]
              </span>
            </span>
          </Link>
          {back && (
            <Link
              href={ROLE_META[ROLE_ORDER.find((r) => signedIn[r]) ?? 'holder'].home}
              className="btn-pill-ghost"
            >
              Back to console
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </header>

        <div className="mt-14 text-center">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.25em] text-brand">
            [ identity selection ]
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-medium uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Sign in to an <span className="text-gradient">identity</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
            ClearScope separates every party on the Midnight network. Each role
            has its own key pair, its own address, and its own portal. Create an
            identity once, then sign in with its seed phrase whenever you return.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLE_ORDER.map((role, i) => {
            const identity = db?.identities[role]
            const Icon = ROLE_ICONS[role]
            const signedInHere = Boolean(signedIn[role])
            const isSigningIn = signInRole === role
            const busy = Boolean(
              pending[`identity-${role}`] || pending[`login-${role}`],
            )
            return (
              <div
                key={role}
                className="animate-fade-up console-card flex flex-col p-6"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] ${ROLE_ACCENT[role]}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-medium uppercase tracking-tight text-white">
                        {ROLE_META[role].label}
                      </p>
                      <p className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/30">
                        [ 0{i + 1} ]
                      </p>
                    </div>
                  </div>
                  {identity ? (
                    <span
                      className={`console-chip ${
                        signedInHere ? 'console-chip-pass' : 'console-chip-neutral'
                      }`}
                    >
                      {signedInHere ? 'signed in' : 'created'}
                    </span>
                  ) : (
                    <span className="console-chip">not created</span>
                  )}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/50">
                  {ROLE_META[role].blurb}
                </p>

                {identity && (
                  <p className="mt-3 truncate font-code text-[0.8rem] text-white/40">
                    {truncateAddress(identity.address, 8, 6)}
                  </p>
                )}

                <div className="mt-5 border-t border-white/10 pt-4">
                  {!identity ? (
                    <button
                      onClick={() => setWizardRole(role)}
                      disabled={busy}
                      className="btn-pill w-full"
                    >
                      {busy ? <Spinner /> : <KeyRound className="h-4 w-4" />}
                      Create {ROLE_META[role].label} identity
                    </button>
                  ) : signedInHere ? (
                    <button
                      onClick={() => enter(role)}
                      className="btn-pill-brand w-full"
                    >
                      Continue as {ROLE_META[role].label}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : isDemoIdentity(role, identity.address) ? (
                    <>
                      <button
                        onClick={() => handleDemoSignIn(role)}
                        disabled={busy}
                        className="btn-pill-brand w-full"
                      >
                        {busy ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
                        Continue as Demo {ROLE_META[role].label}
                      </button>
                      <p className="mt-2 text-center font-mono text-[0.8rem] tracking-[0.15em] text-white/25">
                        demo identity ships with the seeded store
                      </p>
                    </>
                  ) : (
                    <>
                      {isSigningIn ? (
                        <div className="space-y-3">
                          <textarea
                            value={seedInput}
                            onChange={(e) => setSeedInput(e.target.value)}
                            rows={3}
                            placeholder="Enter the 24-word seed phrase"
                            className="console-input w-full resize-none font-code text-[0.8rem]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSignIn(role)}
                              disabled={busy || !seedInput.trim()}
                              className="btn-pill flex-1"
                            >
                              {busy ? <Spinner /> : null}
                              Sign in
                            </button>
                            <button
                              onClick={() => {
                                setSignInRole(null)
                                setSeedInput('')
                              }}
                              className="btn-pill-ghost"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSignInRole(role)
                            setSeedInput('')
                          }}
                          className="btn-pill-ghost w-full"
                        >
                          Sign in with seed phrase
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-10 max-w-md text-center font-mono text-[0.8rem] leading-relaxed tracking-[0.15em] text-white/30">
          Seed phrases stay on your device and are verified against your keys —
          they are never stored in the browser.
        </p>
      </div>
    </div>
  )
}