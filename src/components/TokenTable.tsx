'use client'

import type { TokenEvent } from '@/lib/types'

type EnrichedToken = TokenEvent & {
  totalSupply?: string | null
  decimals?: number
  createdAt?: number | null
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

// MC kasar dari totalSupply × price (price belum ada, placeholder dulu)
function formatSupply(supply: string | null | undefined, decimals = 18): string {
  if (!supply) return '—'
  const n = Number(BigInt(supply) / BigInt(10 ** decimals))
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return `${n}`
}

// AGE dari unix timestamp (akurat dari getPoolCreationTimestamp)
function formatAge(createdAt: number | null | undefined): string {
  if (!createdAt) return '—'
  const now = Math.floor(Date.now() / 1000)
  const diff = now - createdAt
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function shortAddr(addr: string): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function TokenTable({
  tokens,
  onSelect,
}: {
  tokens: EnrichedToken[]
  onSelect?: (token: EnrichedToken) => void
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
          {tokens.map((token, i) => (
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
                        ;(e.target as HTMLImageElement).style.display = 'none'
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
                      <span className="ml-2 text-xs text-text-muted">
                        ${token.tokenSymbol}
                      </span>
                    </div>
                    <div className="mono text-xs text-text-muted">
                      {shortAddr(token.tokenAddress)}
                    </div>
                  </div>
                </div>
              </td>

              {/* Price — akan diisi nanti via GeckoTerminal / on-chain */}
              <td className="py-3 px-4 text-right mono text-text-muted text-xs">—</td>

              {/* MC — dari totalSupply (supply saja, harga menyusul) */}
              <td className="py-3 px-4 text-right mono text-text-secondary">
                {token.totalSupply
                  ? formatSupply(token.totalSupply, token.decimals)
                  : '—'}
              </td>

              {/* Vol 24H — placeholder */}
              <td className="py-3 px-4 text-right mono text-text-muted text-xs">—</td>

              {/* Age — akurat dari getPoolCreationTimestamp */}
              <td className="py-3 px-4 text-right mono text-text-muted">
                {formatAge(token.createdAt)}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
