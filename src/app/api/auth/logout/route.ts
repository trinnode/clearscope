import { NextResponse } from 'next/server'
import { deleteSessionsForRole } from '@/lib/server/sessions'
import type { Role } from '@/lib/sdk/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = (await request.json()) as { role?: Role }
  if (!body.role) {
    return NextResponse.json({ error: 'A role is required.' }, { status: 400 })
  }
  deleteSessionsForRole(body.role)
  return NextResponse.json({ ok: true })
}