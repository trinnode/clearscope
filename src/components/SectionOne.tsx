'use client'

import Link from 'next/link'
import { ArrowDown, Share2 } from 'lucide-react'
import Reveal from './Reveal'

export default function SectionOne() {
  return (
    <div className="relative flex min-h-screen flex-col justify-end px-6 pb-8 pt-24 sm:px-10 sm:pb-10">
      <div className="flex items-start justify-between gap-4">
        <Reveal delay={50} className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] tracking-widest text-white/50">
          <span>( C )</span>
          <span className="text-white/20">/</span>
          <span>[ 001 /004 ]</span>
        </Reveal>
        <Reveal
          delay={100}
          className="hidden max-w-sm text-right font-mono text-[0.875rem] leading-relaxed tracking-wider text-white/60 sm:block"
        >
          <p>
            Proof without exposure. ClearScope turns a compliance question into a single boolean, and never reveals the data behind it.
          </p>
        </Reveal>
      </div>

      <h1 className="mt-8 text-5xl font-medium uppercase leading-none tracking-tight text-white sm:text-8xl lg:text-[9rem]">
        <Reveal as="span" delay={150} className="block">
          Today Proof
        </Reveal>
        <Reveal as="span" delay={250} className="block">
          Aligns <span className="italic">with</span>
        </Reveal>
        <Reveal as="span" delay={350} className="block text-white/40">
          // Bold
        </Reveal>
        <Reveal as="span" delay={450} className="block">
          Scope
        </Reveal>
      </h1>

      <div className="mt-10 flex items-end justify-between gap-4 pb-2">
        <Reveal delay={500} className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] tracking-widest text-white/50">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'ClearScope', url: window.location.href }).catch(() => {})
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).catch(() => {})
              }
            }}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            aria-label="Share ClearScope"
          >
            <Share2 className="w-3 h-3" aria-hidden="true" />
            share
          </button>
        </Reveal>

        <Reveal delay={550} className="hidden sm:flex flex-col items-center gap-1 text-white/40">
          <span className="font-mono text-[0.8rem] tracking-widest">scroll</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" aria-hidden="true" />
        </Reveal>

        <Reveal delay={600}>
          <Link
            href="/verifier"
            className="inline-flex items-center rounded-full border border-white/30 bg-white/5 px-6 py-3 font-mono text-sm uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
          >
            Begin Today
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
