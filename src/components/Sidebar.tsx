'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wallet,
  ScrollText,
  LayoutDashboard,
  FilePlus2,
  BadgeCheck,
  BookOpen,
  GitMerge,
  SwitchCamera,
} from 'lucide-react'
import { useData } from '@/data/provider'
import type { Role } from '@/lib/sdk/types'
import { truncateAddress } from '@/lib/roles'
import ThemeToggle from './ThemeToggle'

interface NavLink {
  href: string
  label: string
  icon: typeof Wallet
}

interface NavSection {
  label: string
  index: string
  links: NavLink[]
}

const SECTION_MAP: Record<Role, NavSection[]> = {
  holder: [
    {
      label: 'Holder',
      index: '01',
      links: [
        { href: '/holder', label: 'Wallet', icon: Wallet },
        { href: '/holder/disclosure-log', label: 'Disclosure log', icon: ScrollText },
      ],
    },
  ],
  verifier: [
    {
      label: 'Verifier',
      index: '02',
      links: [
        { href: '/verifier', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/verifier/new', label: 'New request', icon: FilePlus2 },
      ],
    },
  ],
  issuer: [
    {
      label: 'Issuer',
      index: '03',
      links: [{ href: '/issuer', label: 'Issuer portal', icon: BadgeCheck }],
    },
  ],
  system: [
    {
      label: 'Governance',
      index: '04',
      links: [
        { href: '/governance', label: 'Accreditation', icon: BadgeCheck },
        { href: '/governance/policies', label: 'Policy registry', icon: BookOpen },
        { href: '/governance/policies/compose', label: 'Compose policy', icon: GitMerge },
      ],
    },
  ],
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { db, activeRole, activeAddress } = useData()

  const sections = activeRole ? SECTION_MAP[activeRole] : []
  const identity = activeRole ? db?.identities[activeRole] : null

  return (
    <>
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {sections.map((section) => (
          <div key={section.index}>
            <p className="mb-2 flex items-center justify-between px-2 font-mono text-[0.8rem] uppercase tracking-[0.25em] text-white/30">
              <span>{section.label}</span>
              <span className="text-brand/70">[ {section.index} ]</span>
            </p>
            <ul className="space-y-0.5">
              {section.links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-mono text-[0.8rem] uppercase tracking-[0.15em] transition-colors duration-200 ${
                        active
                          ? 'bg-brand/15 text-white'
                          : 'text-white/50 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 h-4 w-0.5 rounded-full bg-gradient-to-b from-brand to-accent" />
                      )}
                      <link.icon
                        className={`h-4 w-4 ${active ? 'text-brand' : ''}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/identity"
          onClick={onNavigate}
          className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-brand/40 hover:bg-white/[0.05]"
        >
          <span className="flex flex-col leading-tight">
            <span className="font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white/70">
              switch identity
            </span>
            <span className="mt-1 font-code text-[0.8rem] text-white/35">
              {identity ? truncateAddress(activeAddress) : 'no active persona'}
            </span>
          </span>
          <SwitchCamera className="h-4 w-4 text-white/40" />
        </Link>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-white/30">
            identity address
          </p>
          <ThemeToggle />
        </div>
        <p className="flex items-center gap-2 truncate font-code text-[0.75rem] text-white/60">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-brand to-accent" />
          {activeAddress}
        </p>
      </div>
    </>
  )
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-surface-0 sm:flex">
      <div className="border-b border-white/10 p-5">
        <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="ClearScope home">
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
      </div>
      <SidebarNav />
    </aside>
  )
}