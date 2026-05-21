import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const LIQUID_DEPLOY_BLOCK = 44_445_784n
const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'
const LIQUID_API = 'https://app.liquidprotocol.org/api/tokens'

export async function GET() {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL, { timeout: 55_000 }),
    })

    const liquid = new LiquidSDK({ publicClient })

    // 1. Ambil semua token events dari blockchain
    const tokens = await liquid.getTokens({
      fromBlock: LIQUID_DEPLOY_BLOCK,
      toBlock: 'latest',
    })

    console.log('tokens found:', tokens.length)

    // 2. Enrich tiap token dengan info dari Liquid API + pool timestamp
    //    Batasi concurrent requests agar tidak overload
    const BATCH = 10
    const enriched = []

    for (let i = 0; i < tokens.length; i += BATCH) {
      const batch = tokens.slice(i, i + BATCH)

      const results = await Promise.allSettled(
        batch.map(async (token) => {
          try {
            // Fetch token info dari Liquid Protocol API (no key needed)
            const [infoRes, timestampResult] = await Promise.allSettled([
              fetch(`${LIQUID_API}/${token.tokenAddress}/info`).then(r => r.ok ? r.json() : null),
              liquid.getPoolCreationTimestamp(token.poolId as `0x${string}`),
            ])

            const info = infoRes.status === 'fulfilled' ? infoRes.value : null
            const createdAt = timestampResult.status === 'fulfilled' ? timestampResult.value : null

            return {
              ...token,
              // Data dari Liquid API
              totalSupply: info?.totalSupply ?? null,
              decimals: info?.decimals ?? 18,
              hookAddress: info?.hook ?? token.poolHook,
              lockerAddress: info?.locker ?? token.locker,
              // Timestamp akurat dari pool
              createdAt: createdAt ? Number(createdAt) : null,
            }
          } catch {
            return { ...token, createdAt: null }
          }
        })
      )

      for (const r of results) {
        enriched.push(r.status === 'fulfilled' ? r.value : null)
      }
    }

    // Filter null, sort terbaru dulu
    const final = enriched
      .filter(Boolean)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

    return NextResponse.json({
      success: true,
      data: final,
      meta: { count: final.length },
    })
  } catch (error) {
    console.error('API ERROR:', String(error))
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
