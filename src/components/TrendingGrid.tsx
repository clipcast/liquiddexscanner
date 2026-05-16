'use client'

interface TokenEvent {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  tokenImage: string
  startingTick: number
  poolId: string
  blockNumber?: string | bigint
  msgSender: string
  poolHook: string
  locker: string
  pairedToken: string
  mevModule: string
  extensions: string[]
}

export default function TrendingGrid({
  tokens,
  onSelect,
}: {
  tokens: TokenEvent[]
  onSelect?: (token: TokenEvent) => void
}) {
  // Top 6 by some proxy for "trending" (use startingTick as a proxy for market cap)
  const sorted = [...tokens]
    .sort((a, b) => Math.abs(b.startingTick) - Math.abs(a.startingTick))
    .slice(0, 6)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {sorted.map((token) => (
        <div
          key={token.tokenAddress}
          onClick={() => onSelect?.(token)}
          className="bg-dark-card rounded-xl border border-dark-border p-5 hover:border-accent-green/30 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-green/20 to-blue-buy/20 flex items-center justify-center text-lg font-bold text-accent-green uppercase">
                {token.tokenSymbol?.slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-text-primary group-hover:text-accent-green transition-colors">
                  {token.tokenName}
                </div>
                <div className="mono text-sm text-text-secondary">
                  {token.tokenSymbol}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-accent-green text-sm">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-dot" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-text-muted text-xs mono uppercase">Tick</div>
              <div className="mono text-text-secondary">
                {token.startingTick?.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-text-muted text-xs mono uppercase">Block</div>
              <div className="mono text-text-secondary">
                {token.blockNumber?.toString() || '-'}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-text-muted text-xs mono uppercase mb-1">Pool</div>
              <div className="mono text-xs text-text-muted truncate">
                {token.poolId}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
