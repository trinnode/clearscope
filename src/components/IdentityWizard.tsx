'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '@/data/provider'
import { SEED_WORDS } from '@/lib/sdk/wallet'
import type { Role } from '@/lib/sdk/types'
import { ROLE_META } from '@/lib/roles'
import Logo from './Logo'
import MonoText from './MonoText'
import { ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'
import confetti from 'canvas-confetti'

type Step = 'intro' | 'creating' | 'seed' | 'verify' | 'done'

interface ChallengeSlot {
  index: number
  word: string
  options: string[]
}

const CHALLENGE_COUNT = 3
const CREATING_LINES = [
  'generating key material',
  'deriving address',
  'sealing private state',
  'finalizing',
]

function shuffle<T>(array: T[]): T[] {
  const out = [...array]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function uniqueDecoys(seedWord: string, count: number): string[] {
  const used = new Set<string>([seedWord])
  const out: string[] = []
  while (out.length < count) {
    const w = SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)]
    if (!used.has(w)) {
      used.add(w)
      out.push(w)
    }
  }
  return out
}

function buildChallenge(seed: string): ChallengeSlot[] {
  const words = seed.split(' ')
  const indices = shuffle(words.map((_, i) => i)).slice(0, CHALLENGE_COUNT)
  return indices.map((i) => ({
    index: i,
    word: words[i],
    options: shuffle([words[i], ...uniqueDecoys(words[i], 5)]),
  }))
}

export default function IdentityWizard({
  role,
  onComplete,
}: {
  role: Role
  onComplete: () => void
}) {
  const { db, createIdentity, markSeedBackedUp, getSessionSeed } = useData()
  const meta = ROLE_META[role]
  const [step, setStep] = useState<Step>('intro')
  const [line, setLine] = useState(0)
  const [slot, setSlot] = useState(0)
  const [mistake, setMistake] = useState<number | null>(null)
  const [verifySeed, setVerifySeed] = useState<string | null>(null)
  const [seed, setSeed] = useState<string | null>(null)
  const challenge = useRef<ChallengeSlot[] | null>(null)

  useEffect(() => {
    if (step !== 'creating') return
    const interval = setInterval(() => {
      setLine((l) => (l + 1) % CREATING_LINES.length)
    }, 700)
    return () => clearInterval(interval)
  }, [step])

  useEffect(() => {
    if (step === 'done') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.35 },
        colors: ['#7DD3FC', '#ffffff', '#A78BFA'],
      })
    }
  }, [step])

  async function handleCreate() {
    setStep('creating')
    await Promise.all([
      createIdentity(role),
      new Promise((r) => setTimeout(r, 1600)),
    ])
    setSeed(getSessionSeed(role))
    setStep('seed')
  }

  function handleVerifyStart() {
    if (!seed) return
    markSeedBackedUp(role, true)
    setVerifySeed(seed)
    challenge.current = buildChallenge(seed)
    setSlot(0)
    setMistake(null)
    setStep('verify')
  }

  function handlePick(word: string) {
    const slots = challenge.current
    if (!slots || !verifySeed) return
    const target = slots[slot]
    if (word === target.word) {
      setSlot((s) => s + 1)
      if (slot === CHALLENGE_COUNT - 1) setStep('done')
    } else {
      setMistake(target.index)
      setTimeout(() => setMistake(null), 900)
    }
  }

  const progress = useMemo(() => {
    const map: Record<Step, number> = {
      intro: 1,
      creating: 2,
      seed: 2,
      verify: 3,
      done: 4,
    }
    return map[step]
  }, [step])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-0 px-6 text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(125,211,252,0.12),transparent_60%)]"
      />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <p className="mb-8 animate-fade-up font-mono text-[0.75rem] uppercase tracking-[0.25em] text-white/40">
          [ {String(progress).padStart(2, '0')} /04 ] · {meta.label} identity
        </p>

        <Logo markOnly markClassName="w-12 h-12 text-brand mb-8" />

        {step === 'intro' && (
          <div className="animate-fade-up flex flex-col items-center">
            <h1 className="font-display text-4xl font-medium uppercase leading-[0.95] tracking-tight sm:text-5xl">
              Create your
              <br />
              <span className="text-gradient">{meta.createTitle}</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/50">
              {meta.blurb}
            </p>
            <button onClick={handleCreate} className="btn-pill mt-10 px-8 py-3">
              <KeyRound className="h-4 w-4" />
              Create {meta.label} identity
            </button>
          </div>
        )}

        {step === 'creating' && (
          <div className="animate-fade-up flex flex-col items-center">
            <div className="relative mb-10">
              <div className="h-16 w-16 rounded-full border border-white/15" />
              <div className="absolute inset-0 animate-console-spin rounded-full border-t-2 border-brand" />
            </div>
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-brand">
              {CREATING_LINES[line]}
            </p>
          </div>
        )}

        {step === 'seed' && seed && (
          <div className="animate-fade-up w-full text-center">
            <h1 className="font-display text-3xl font-medium uppercase leading-[0.95] tracking-tight sm:text-4xl">
              Backup your seed
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              These 24 words are the only way to recover this {meta.label}{' '}
              identity. Write them down and store them somewhere safe.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              {seed.split(' ').map((word, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-code text-[0.75rem] text-white/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-sm text-white/85">{word}</span>
                </div>
              ))}
            </div>
            <button onClick={handleVerifyStart} className="btn-pill mt-10 px-8 py-3">
              I have stored it securely
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 'verify' && challenge.current && (
          <div className="animate-fade-up w-full text-center">
            <p className="mb-2 font-mono text-[0.75rem] uppercase tracking-[0.25em] text-white/40">
              [ verification ] · confirm the seed
            </p>
            <h1 className="font-display text-3xl font-medium uppercase leading-[0.95] tracking-tight">
              Select word{' '}
              <span className="text-gradient">
                #{challenge.current[slot].index + 1}
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Choose the correct word to confirm your backup.
            </p>
            <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2">
              {challenge.current[slot].options.map((word) => (
                <button
                  key={word}
                  onClick={() => handlePick(word)}
                  className={`rounded-xl border px-4 py-3 font-mono text-sm transition-all duration-150 cursor-pointer ${
                    mistake === challenge.current![slot].index
                      ? 'border-fail/60 bg-fail/10 text-fail'
                      : 'border-white/10 bg-white/[0.03] text-white/85 hover:border-brand/50 hover:bg-white/[0.06]'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="animate-fade-up flex flex-col items-center">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-pass/40 bg-pass/10">
              <ShieldCheck className="h-7 w-7 text-pass" />
            </div>
            <h1 className="font-display text-4xl font-medium uppercase leading-[0.95] tracking-tight">
              Identity ready
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              {meta.blurb}
            </p>
            <div className="mt-8 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="console-label">identity address</span>
              <MonoText>{db?.identities[role]?.address ?? ''}</MonoText>
            </div>
            <button onClick={onComplete} className="btn-pill mt-10 px-8 py-3">
              Enter {meta.label} console
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}