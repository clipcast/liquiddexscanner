import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { LiquidSDK } from 'liquid-sdk'

// @ts-expect-error — process.env
const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

let _publicClient: ReturnType<typeof createPublicClient> | null = null
let _liquid: LiquidSDK | null = null

function getPublicClient() {
  if (!_publicClient) {
    // @ts-expect-error - viem version mismatch with liquid-sdk
    _publicClient = createPublicClient({
      chain: base,
      transport: http(RPC_URL),
    })
  }
  return _publicClient
}

export function getLiquid(): LiquidSDK {
  if (!_liquid) {
    _liquid = new LiquidSDK({ publicClient: getPublicClient() })
  }
  return _liquid
}

export async function getAllTokens() {
  const liquid = getLiquid()
  try {
    const tokens = await liquid.getTokens()
    return tokens
  } catch (err) {
    console.error('Failed to fetch tokens:', err)
    return []
  }
}

export async function getTokenEvent(address: `0x${string}`) {
  const liquid = getLiquid()
  try {
    return await liquid.getTokenEvent(address)
  } catch {
    return null
  }
}

export async function getTokenInfo(address: `0x${string}`) {
  const liquid = getLiquid()
  try {
    return await liquid.getTokenInfo(address)
  } catch {
    return null
  }
}

export async function getAuctionState(poolId: `0x${string}`) {
  const liquid = getLiquid()
  try {
    return await liquid.getAuctionState(poolId)
  } catch {
    return null
  }
}

export async function getVaultAllocation(address: `0x${string}`) {
  const liquid = getLiquid()
  try {
    return await liquid.getVaultAllocation(address)
  } catch {
    return null
  }
}

export async function getAirdropInfo(address: `0x${string}`) {
  const liquid = getLiquid()
  try {
    return await liquid.getAirdropInfo(address)
  } catch {
    return null
  }
}

export async function getTokenRewards(address: `0x${string}`) {
  const liquid = getLiquid()
  try {
    return await liquid.getTokenRewards(address)
  } catch {
    return null
  }
}
