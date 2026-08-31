'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { SidebarNav } from './Sidebar'
import ThemeToggle from './ThemeToggle'

export default function MobileNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-surface-0/90 px-4 py-3 backdrop-blur sm:hidden">
        <Link
          href="/"
          className="flex flex-col leading-none"
          aria-label="ClearScope home"
        >
          <span className="font-mono text-sm tracking-[0.2em] text-white">
            ( CLEARSCOPE )
          </span>
          <span className="mt-1 font-mono text-[0.8rem] tracking-[0.2em] text-white/40">
            [ identity console ]
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-[0.8rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu className="h-3.5 w-3.5" />
            menu
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-pointer bg-[rgba(0,0,0,0.7)]"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/10 bg-surface-0">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-mono text-sm tracking-[0.25em] text-white"
                aria-label="ClearScope home"
              >
                ( CLEARSCOPE )
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setOpen(false)}
                  className="btn-icon"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}