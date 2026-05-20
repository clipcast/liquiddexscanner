'use client'

import type { TokenEvent } from '@/lib/types'

type PriceData = {
  price_usd: string | null
  market_cap_usd: string | null
  volume_usd_h24: string | null
}

function formatUSD(val: string | number | null | undefined): string {
  const n = parseFloat(String(val || '0'))
  if (!n || isNaN(n)) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  if (n < 0.000001) return `$${n.toExponential(2)}`
  return `$${n.toFixed(6)}`
}

function formatAge(blockNumber: string | number | bigint | undefined): string {
  if (!blockNumber) return '—'
  const CURRENT_BLOCK = 46_600_000 // estimasi block Base sekarang
  const diff = CURRENT_BLOCK - Number(blockNumber)
  const seconds = diff * 2 // Base ~2 detik per block
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function shortAddr(addr: string): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function TokenTable({
  tokens,
  prices = {},
  onSelect,
}: {
  tokens: TokenEvent[]
  prices?: Record<string, PriceData>
  onSelect?: (token: TokenEvent) => void
}) {
  if (tokens.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted mono text-sm">
        Tidak ada token ditemukan
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-border text-text-muted mono text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4">#</th>
            <th className="text-left py-3 px-4">Token</th>
            <th className="text-right py-3 px-4">Price</th>
            <th className="text-right py-3 px-4">MC</th>
            <th className="text-right py-3 px-4">Vol 24H</th>
            <th className="text-right py-3 px-4">Age</th>
            <th className="text-right py-3 px-4">Deployer</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => {
            const p = prices[token.tokenAddress]
            return (
              <tr
                key={token.tokenAddress}
                onClick={() => onSelect?.(token)}
                className="border-b border-dark-border/40 hover:bg-dark-card/50 cursor-pointer transition-colors"
              >
                {/* # */}
                <td className="py-3 px-4 text-text-muted mono">{i + 1}</td>

                {/* Token */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {token.tokenImage ? (
                      <img
                        src={token.tokenImage}
                        alt={token.tokenSymbol}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center text-xs text-accent-green font-bold uppercase">
                        {token.tokenSymbol?.slice(0, 2) ?? '??'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-text-primary">
                        {token.tokenName}
                        <span className="ml-2 text-xs text-text-muted">${token.tokenSymbol}</span>
                      </div>
                      <div className="mono text-xs text-text-muted">
                        {shortAddr(token.tokenAddress)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-4 text-right mono">
                  {p ? (
                    <span className="text-text-primary">{formatUSD(p.price_usd)}</span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </td>

                {/* MC */}
                <td className="py-3 px-4 text-right mono">
                  {p ? (
                    <span className="text-text-secondary">{formatUSD(p.market_cap_usd)}</span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </td>

                {/* Vol 24H */}
                <td className="py-3 px-4 text-right mono">
                  {p ? (
                    <span className="text-text-secondary">{formatUSD(p.volume_usd_h24)}</span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </td>

                {/* Age */}
                <td className="py-3 px-4 text-right mono text-text-muted">
                  {formatAge(token.blockNumber)}
                </td>

                {/* Deployer */}
                <td className="py-3 px-4 text-right">
                  <a
                    href={`https://basescan.org/address/${token.msgSender}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mono text-xs text-text-muted hover:text-accent-green transition-colors"
                  >
                    {shortAddr(token.msgSender)}
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
