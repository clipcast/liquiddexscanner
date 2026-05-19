import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    })

    // Sesuai docs: cukup pass publicClient, tidak perlu contracts
    const liquid = new LiquidSDK({ publicClient })

    // Sesuai docs: getTokens() tanpa parameter → ambil semua token Liquid Protocol
    const tokens = await liquid.getTokens()

    console.log('tokens found:', tokens.length)

    return NextResponse.json({
      success: true,
      data: tokens,
    })
  } catch (error) {
    console.error('API ERROR:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
