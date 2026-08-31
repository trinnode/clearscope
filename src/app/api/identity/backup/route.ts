import { NextResponse } from 'next/server'
import { setSeedBackedUp } from '@/lib/server/db'
import type { Role } from '@/lib/sdk/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: Role; backedUp?: boolean }
    if (!body.role) {
      return NextResponse.json({ error: 'A role is required.' }, { status: 400 })
    }
    const db = await setSeedBackedUp(body.role, Boolean(body.backedUp))
    return NextResponse.json({ db })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update backup status.' },
      { status: 400 },
    )
  }
}