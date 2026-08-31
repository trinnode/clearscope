import { NextResponse } from 'next/server'
import { issueCredential, AccessDeniedError } from '@/lib/server/db'
import type { IssueCredentialInput } from '@/lib/server/db'
import { actorFromRequest, UnauthenticatedError } from '@/lib/server/actor'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request)
    const body = (await request.json()) as Partial<IssueCredentialInput>
    if (!body.holderAddress) {
      return NextResponse.json(
        { error: 'A target holder address is required to issue a credential.' },
        { status: 400 },
      )
    }
    const db = await issueCredential(
      {
        issuer: body.issuer ?? '',
        type: body.type ?? '',
        attributes: body.attributes ?? {},
        holderAddress: body.holderAddress,
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
      { error: error instanceof Error ? error.message : 'Failed to issue credential.' },
      { status: 400 },
    )
  }
}