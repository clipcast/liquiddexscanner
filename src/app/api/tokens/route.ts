import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from '@liquid-protocol/sdk' // pastikan ini sesuai package kamu

const RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

// 🔥 CONTRACT CONFIG (WAJIB)
const CONTRACTS = {
  factory: '0x04F1a284168743759BE6554f607a10CEBdB77760',
}

export async function GET() {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    })

    // 🔥 Inject contract ke SDK
    const liquid = new LiquidSDK({
      publicClient,
      contracts: CONTRACTS,
    })

    const latestBlock = await publicClient.getBlockNumber()

    // 🔥 FIX RANGE (PENTING BANGET)
    const fromBlock = 0n // scan dari awal biar pasti dapet

    console.log('latestBlock:', latestBlock.toString())
    console.log('fromBlock:', fromBlock.toString())

    const tokens = await liquid.getTokens({
      fromBlock,
      toBlock: 'latest',
    })

    console.log('tokens found:', tokens.length)

    return NextResponse.json({
      success: true,
      tokens,
    })
  } catch (error) {
    console.error('API ERROR:', error)

    return NextResponse.json({
      success: false,
      error: 'failed to fetch tokens',
    })
  }
}
