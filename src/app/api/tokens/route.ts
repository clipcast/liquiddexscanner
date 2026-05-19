import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

const SCAN_RANGE = 50_000n

export async function GET() {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    })

    const liquid = new LiquidSDK({ publicClient })

    const latestBlock = await publicClient.getBlockNumber()
    const fromBlock = latestBlock > SCAN_RANGE ? latestBlock - SCAN_RANGE : 0n

    console.log('latestBlock:', latestBlock.toString())
    console.log('fromBlock:', fromBlock.toString())

    const tokens = await liquid.getTokens({
      fromBlock,
      toBlock: 'latest',
    })

    console.log('tokens found:', tokens.length)

    return NextResponse.json({
      success: true,
      data: tokens,
    })
  } catch (error) {
    console.error('API ERROR:', error)

    return NextResponse.json(
      { success: false, error: 'failed to fetch tokens' },
      { status: 500 }
    )
  }
}
