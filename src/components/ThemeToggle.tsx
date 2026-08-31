'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [light, setLight] = useState(false)

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'))
  }, [])

  function toggle() {
    const next = !light
    setLight(next)
    document.documentElement.classList.toggle('light', next)
    try {
      window.localStorage.setItem('clearscope-theme', next ? 'light' : 'dark')
    } catch {
      // ignore storage errors
    }
  }

  return (
    <button
      onClick={toggle}
      className="btn-icon"
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      title={light ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {light ? (
        <Sun className="h-4 w-4 text-pending" />
      ) : (
        <Moon className="h-4 w-4 text-brand" />
      )}
    </button>
  )
}