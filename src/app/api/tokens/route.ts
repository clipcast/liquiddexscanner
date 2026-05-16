import { NextResponse } from 'next/server'
import { getLiquid } from '@/lib/liquid'

export const dynamic = 'force-dynamic'
export const revalidate = 10

export async function GET(request: Request) {
  try {
    const liquid = getLiquid()
    const latestBlock = await liquid.publicClient.getBlockNumber()
    const fromBlock = latestBlock - 200000n // last ~200K blocks
    const tokens = await liquid.getTokens({ fromBlock, toBlock: 'latest' })
    return NextResponse.json({
      success: true,
      count: tokens.length,
      currentBlock: latestBlock.toString(),
      data: tokens,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tokens'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
