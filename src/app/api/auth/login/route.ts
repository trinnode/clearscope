import { NextResponse } from 'next/server'
import { verifySeed, getIdentity, AccessDeniedError } from '@/lib/server/db'
import { createSession } from '@/lib/server/sessions'
import type { Role } from '@/lib/sdk/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: Role; seedPhrase?: string }
    if (!body.role || !body.seedPhrase) {
      return NextResponse.json(
        { error: 'Role and seed phrase are required.' },
        { status: 400 },
      )
    }
    const seedPhrase = await verifySeed(body.role, body.seedPhrase)
    const identity = await getIdentity(body.role)
    const session = createSession(body.role, identity.address)
    return NextResponse.json({
      token: session.token,
      role: session.role,
      address: session.address,
      seedPhrase,
    })
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign in failed.' },
      { status: 400 },
    )
  }
}