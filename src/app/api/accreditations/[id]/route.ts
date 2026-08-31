import { NextResponse } from 'next/server'
import { updateAccreditation, AccessDeniedError } from '@/lib/server/db'
import { actorFromRequest, UnauthenticatedError } from '@/lib/server/actor'
import type { AccreditationStatus } from '@/lib/sdk/types'

export const dynamic = 'force-dynamic'

const VALID_STATUS: AccreditationStatus[] = ['ACTIVE', 'SUSPENDED', 'REVOKED']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const actor = actorFromRequest(request)
    const body = (await request.json()) as {
      status?: AccreditationStatus
      expiresAt?: number
    }
    if (body.status && !VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid accreditation status.' }, { status: 400 })
    }
    const db = await updateAccreditation(id, body, actor.address)
    return NextResponse.json({ db })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update accreditation.' },
      { status: 400 },
    )
  }
}