import { NextResponse } from 'next/server'
import { respondToRequest, AccessDeniedError } from '@/lib/server/db'
import { actorFromRequest, UnauthenticatedError } from '@/lib/server/actor'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const actor = actorFromRequest(request)
    const body = (await request.json()) as { credentialId?: string }
    if (!body.credentialId) {
      return NextResponse.json(
        { error: 'A credential is required to respond.' },
        { status: 400 },
      )
    }
    const { db, request: updated } = await respondToRequest(
      id,
      body.credentialId,
      actor.address,
    )
    return NextResponse.json({ db, request: updated })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to respond to request.' },
      { status: 400 },
    )
  }
}