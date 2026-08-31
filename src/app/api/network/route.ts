import { NextResponse } from 'next/server'
import { getNetworkStatus } from '@/lib/sdk/wallet'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = await getNetworkStatus()
    return NextResponse.json(status)
  } catch {
    return NextResponse.json(
      { error: 'Network check failed.' },
      { status: 500 },
    )
  }
}
