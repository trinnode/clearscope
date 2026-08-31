'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'main', href: '/' },
  { label: 'wallet', href: '/holder' },
  { label: 'verifier', href: '/verifier' },
  { label: 'governance', href: '/governance' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-6 py-6 sm:px-10 sm:py-8">
      <Link
        href="/"
        className="flex flex-col items-start leading-none group"
        aria-label="ClearScope home"
      >
        <span className="font-mono text-base tracking-widest text-white transition-colors group-hover:text-white/70">
          ( CLEARSCOPE )
        </span>
        <span className="mt-1.5 font-mono text-[0.75rem] tracking-widest text-white/50">
          [ v.01b ]
        </span>
      </Link>

      <nav className="hidden flex-col items-end gap-4 sm:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group inline-flex items-center gap-1.5 font-mono text-[0.8rem] tracking-widest uppercase text-white/70 transition-colors hover:text-white"
          >
            {link.label}
            <ArrowUpRight
              className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </nav>

      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 font-mono text-sm uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black sm:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-3.5 h-3.5" />
        menu
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-base tracking-widest text-white">
              ( CLEARSCOPE )
            </span>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 p-2 text-white transition-colors hover:bg-white hover:text-black"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="mt-16 flex flex-col gap-6">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between border-b border-white/10 pb-5 font-mono text-xl uppercase tracking-widest text-white transition-colors hover:text-white/60"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
                <ArrowUpRight
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>

          <p className="mt-auto font-mono text-[0.75rem] tracking-widest text-white/40">
            [ clearscope · identity console ]
          </p>
        </div>
      )}
    </header>
  )
}