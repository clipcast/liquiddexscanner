import { marketCapFromTickETH, marketCapFromTickUSD } from 'liquid-sdk'

export function formatPrice(wei: bigint, decimals: number = 18): string {
  const num = Number(wei) / 10 ** decimals
  if (num >= 1) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  if (num >= 0.0001) return num.toFixed(6)
  return num.toFixed(10)
}

export function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getTokenAge(blockNumber: bigint | undefined): string {
  if (!blockNumber) return 'N/A'
  // Rough estimate: ~2s per block on Base
  const now = Math.floor(Date.now() / 1000)
  const blocksSinceCreation = 0 // We don't have the current block easily
  // Use block number difference
  return `${blockNumber.toString()} blocks`
}

export function calculateMarketCap(startingTick: number, ethPriceUsd: number = 2700): number {
  return marketCapFromTickUSD(startingTick, ethPriceUsd)
}

export function getTimeAgo(blockNumber: bigint, currentBlock: bigint): string {
  const diff = Number(currentBlock - blockNumber)
  const seconds = diff * 2 // ~2s per block on Base
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function copyToClipboard(text: string): void {
  if (typeof navigator !== 'undefined') {
    navigator.clipboard.writeText(text).catch(() => {})
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
