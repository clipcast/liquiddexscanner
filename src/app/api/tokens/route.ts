import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Block pertama token Liquid Protocol
// TX: 0x6ac41c71c7a4394b3de85ca95dfae1d58dcc664fcdce1f9c3a67734747ea63c9
const LIQUID_DEPLOY_BLOCK = 44_445_784n

const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

export async function GET() {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL, { timeout: 55_000 }),
    })

    const liquid = new LiquidSDK({ publicClient })
    const latestBlock = await publicClient.getBlockNumber()

    console.log(`Scanning blocks ${LIQUID_DEPLOY_BLOCK} → ${latestBlock}`)

    // Fetch semua token dari block pertama Liquid Protocol
    const tokens = await liquid.getTokens({
      fromBlock: LIQUID_DEPLOY_BLOCK,
      toBlock: 'latest',
    })

    console.log('tokens found:', tokens.length)

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        fromBlock: LIQUID_DEPLOY_BLOCK.toString(),
        toBlock: latestBlock.toString(),
        count: tokens.length,
      },
    })
  } catch (error) {
    console.error('API ERROR:', String(error))
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
