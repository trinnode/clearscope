import { NextResponse } from 'next/server'
import { resetStore } from '@/lib/server/db'
import { clearSessions } from '@/lib/server/sessions'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    clearSessions()
    const db = await resetStore()
    return NextResponse.json({ db })
  } catch {
    return NextResponse.json({ error: 'Failed to reset store.' }, { status: 500 })
  }
}