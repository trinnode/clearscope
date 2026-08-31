'use client'

import { useRouter } from 'next/navigation'
import IdentityLauncher from '@/components/IdentityLauncher'
import { ROLE_META } from '@/lib/roles'
import type { Role } from '@/lib/sdk/types'

export default function IdentityPage() {
  const router = useRouter()
  return (
    <IdentityLauncher
      back
      onEnter={(role: Role) => router.push(ROLE_META[role].home)}
    />
  )
}