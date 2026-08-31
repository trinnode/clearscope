import { NextResponse } from 'next/server'
import { getState } from '@/lib/server/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getState()
    return NextResponse.json(db)
  } catch {
    return NextResponse.json({ error: 'Failed to load state.' }, { status: 500 })
  }
}
