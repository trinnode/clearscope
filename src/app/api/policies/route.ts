import { NextResponse } from 'next/server'
import { composePolicy, AccessDeniedError } from '@/lib/server/db'
import type { Policy } from '@/lib/sdk/types'
import { actorFromRequest, UnauthenticatedError } from '@/lib/server/actor'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request)
    const body = (await request.json()) as Partial<Policy>
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: 'A policy name and id are required.' },
        { status: 400 },
      )
    }
    const db = await composePolicy(body as Policy, actor.address)
    return NextResponse.json({ db })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compose policy.' },
      { status: 400 },
    )
  }
}