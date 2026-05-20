import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Block pertama token Liquid Protocol di-deploy
// TX: 0x6ac41c71c7a4394b3de85ca95dfae1d58dcc664fcdce1f9c3a67734747ea63c9
// Block: 44_445_784
const LIQUID_DEPLOY_BLOCK = 44_445_784n

const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromBlockParam = searchParams.get('fromBlock')

  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL, {
        timeout: 55_000,
      }),
    })

    const liquid = new LiquidSDK({ publicClient })

    const latestBlock = await publicClient.getBlockNumber()

    const fromBlock = fromBlockParam
      ? BigInt(fromBlockParam)
      : LIQUID_DEPLOY_BLOCK

    console.log(`Scanning blocks ${fromBlock} → ${latestBlock}`)
    console.log(`Range: ${(latestBlock - fromBlock).toLocaleString()} blocks`)

    const tokens = await liquid.getTokens({ fromBlock, toBlock: 'latest' })

    console.log('tokens found:', tokens.length)

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        fromBlock: fromBlock.toString(),
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
