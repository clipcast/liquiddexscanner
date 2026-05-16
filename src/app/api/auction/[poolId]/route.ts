import { NextResponse } from 'next/server'
import { getAuctionState } from '@/lib/liquid'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { poolId: string } }
) {
  const poolId = params.poolId as `0x${string}`
  if (!poolId || !poolId.startsWith('0x') || poolId.length !== 66) {
    return NextResponse.json({ success: false, error: 'Invalid pool ID' }, { status: 400 })
  }

  try {
    const state = await getAuctionState(poolId)
    return NextResponse.json({ success: true, data: state })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch auction state'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
