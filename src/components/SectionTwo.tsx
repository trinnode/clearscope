'use client'

import Link from 'next/link'
import { Share2 } from 'lucide-react'
import Reveal from './Reveal'

export default function SectionTwo() {
  return (
    <div id="section-two" className="relative flex min-h-screen flex-col justify-end px-6 pb-8 pt-24 sm:px-10 sm:pb-10">
      <div className="flex items-start justify-between gap-4">
        <Reveal delay={50} className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] tracking-widest text-white/50">
          <span>( P )</span>
          <span className="text-white/20">/</span>
          <span>[ 002 /004 ]</span>
        </Reveal>
        <Reveal
          delay={100}
          className="hidden max-w-sm text-right font-mono text-[0.75rem] leading-relaxed tracking-wider text-white/60 sm:block"
        >
          <p>
            Ask for exactly one thing. Get back a scoped answer, not the private state behind it.
          </p>
        </Reveal>
      </div>

      <h2 className="mt-8 text-5xl font-medium uppercase leading-none tracking-tight text-white sm:text-8xl lg:text-[9rem]">
        <Reveal as="span" delay={150} className="block">
          Prove <span className="italic">exactly</span>
        </Reveal>
        <Reveal as="span" delay={250} className="block">
          What&apos;s Asked
        </Reveal>
      </h2>

      <div className="mt-10 flex items-end justify-between gap-4 pb-2">
        <Reveal delay={350} className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] tracking-widest text-white/50">
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

        <Reveal delay={400}>
          <Link
            href="/holder"
            className="inline-flex items-center rounded-full border border-white/30 bg-white/5 px-6 py-3 font-mono text-sm uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
          >
            Enter Console
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
