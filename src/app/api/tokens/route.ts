import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // max untuk Vercel Pro, diabaikan di Hobby

const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

// Factory deploy di Base sekitar block 29_700_000 (Mei 2025)
// Scan 100k block terakhir saja agar tidak timeout
const SCAN_RANGE = 100_000n

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromBlockParam = searchParams.get('fromBlock')

  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    })

    const liquid = new LiquidSDK({ publicClient })

    const latestBlock = await publicClient.getBlockNumber()

    // Kalau ada query param fromBlock, gunakan itu (untuk pagination)
    // Kalau tidak, scan 100k block terakhir
    const fromBlock = fromBlockParam
      ? BigInt(fromBlockParam)
      : latestBlock > SCAN_RANGE
        ? latestBlock - SCAN_RANGE
        : 0n

    const toBlock = latestBlock

    console.log(`Scanning blocks ${fromBlock} → ${toBlock}`)

    const tokens = await liquid.getTokens({ fromBlock, toBlock: 'latest' })

    console.log('tokens found:', tokens.length)

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        fromBlock: fromBlock.toString(),
        toBlock: toBlock.toString(),
        count: tokens.length,
      },
    })
  } catch (error) {
    console.error('API ERROR:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
