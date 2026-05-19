import { NextResponse } from 'next/server'
import { getTokenEvent, getTokenInfo, getTokenRewards } from '@/lib/liquid'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  const address = params.address as `0x${string}`
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return NextResponse.json({ success: false, error: 'Invalid address' }, { status: 400 })
  }

  try {
    const [event, info, rewards] = await Promise.all([
      getTokenEvent(address),
      getTokenInfo(address),
      getTokenRewards(address),
    ])

    return NextResponse.json({
      success: true,
      data: { event, info, rewards },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch token'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
