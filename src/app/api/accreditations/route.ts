import { NextResponse } from 'next/server'
import { accreditEntity, AccessDeniedError } from '@/lib/server/db'
import type { AccreditEntityInput } from '@/lib/server/db'
import { actorFromRequest, UnauthenticatedError } from '@/lib/server/actor'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request)
    const body = (await request.json()) as Partial<AccreditEntityInput>
    if (
      !body.entityName ||
      !body.licenseRef ||
      !body.role ||
      !body.address ||
      !body.expiryMs
    ) {
      return NextResponse.json(
        {
          error:
            'Entity name, license reference, role, bound address and expiry are required.',
        },
        { status: 400 },
      )
    }
    const db = await accreditEntity(
      {
        entityName: body.entityName,
        licenseRef: body.licenseRef,
        role: body.role,
        address: body.address,
        expiryMs: body.expiryMs,
      },
      actor.address,
    )
    return NextResponse.json({ db })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accredit entity.' },
      { status: 400 },
    )
  }
}