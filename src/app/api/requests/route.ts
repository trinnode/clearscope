import { NextResponse } from 'next/server'
import { createRequest, AccessDeniedError } from '@/lib/server/db'
import type { CreateRequestInput } from '@/lib/server/db'
import { actorFromRequest, UnauthenticatedError } from '@/lib/server/actor'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request)
    const body = (await request.json()) as Partial<CreateRequestInput>
    if (!body.policyId) {
      return NextResponse.json({ error: 'A policy is required.' }, { status: 400 })
    }
    if (!body.holderAddress) {
      return NextResponse.json(
        { error: 'A target holder address is required to create a request.' },
        { status: 400 },
      )
    }
    const { db, request: created } = await createRequest(
      {
        policyId: body.policyId,
        requesterName: body.requesterName ?? 'Verifier',
        expiryMs: body.expiryMs ?? 7 * 24 * 60 * 60 * 1000,
        params: body.params ?? {},
        holderAddress: body.holderAddress,
      },
      actor.address,
    )
    return NextResponse.json({ db, request: created })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create request.' },
      { status: 400 },
    )
  }
}