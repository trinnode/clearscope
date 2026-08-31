import { NextResponse } from 'next/server'
import { createIdentity, deleteIdentity } from '@/lib/server/db'
import { createSession, deleteSessionsForRole } from '@/lib/server/sessions'
import type { Role } from '@/lib/sdk/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      role?: Role
      seedPhrase?: string
      address?: string
      seedBackedUp?: boolean
    }
    if (!body.role || !body.seedPhrase || !body.address) {
      return NextResponse.json(
        { error: 'Role, seed phrase and address are required.' },
        { status: 400 },
      )
    }
    const db = await createIdentity({
      role: body.role,
      seedPhrase: body.seedPhrase,
      address: body.address,
      seedBackedUp: body.seedBackedUp,
    })
    const session = createSession(body.role, body.address)
    return NextResponse.json({
      db,
      session: {
        token: session.token,
        role: session.role,
        address: session.address,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create identity.' },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { role?: Role }
    if (!body.role) {
      return NextResponse.json({ error: 'A role is required.' }, { status: 400 })
    }
    const db = await deleteIdentity(body.role)
    deleteSessionsForRole(body.role)
    return NextResponse.json({ db })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete identity.' },
      { status: 400 },
    )
  }
}