'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TokenCreatedEvent } from 'liquid-sdk'
import TickerTape from '@/components/TickerTape'
import NavTabs from '@/components/NavTabs'
import StatsRow from '@/components/StatsRow'
import TokenTable from '@/components/TokenTable'
import TrendingGrid from '@/components/TrendingGrid'
import PriceChart from '@/components/PriceChart'

// Gunakan tipe dari liquid-sdk langsung, lebih akurat dari tipe lokal
type Token = TokenCreatedEvent

export default function Home() {
  const [activeTab, setActiveTab] = useState('new')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [ethPrice] = useState(2700)

  const fetchTokens = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/tokens', { cache: 'no-store' })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'API failed')
      }

      const list: Token[] = json.data || []
      // Token terbaru di atas
      setTokens([...list].reverse())
    } catch (err) {
      console.error('Failed to fetch tokens:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokens()
    // Refresh tiap 30 detik (lebih hemat RPC calls)
    const interval = setInterval(fetchTokens, 30_000)
    return () => clearInterval(interval)
  }, [fetchTokens])

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token)
    setActiveTab('chart')

    // Generate mock chart data berdasarkan startingTick
    const mockData: any[] = []
    const basePrice = Math.max(0.000001, Math.abs(token.startingTick) / 100000)
    for (let i = 0; i < 24; i++) {
      const variance = (Math.random() - 0.5) * basePrice * 0.3
      mockData.push({
        time: `${i}:00`,
        price: basePrice + variance,
      })
    }
    setChartData(mockData)
  }

  const avgTick =
    tokens.length > 0
      ? tokens.reduce((s, t) => s + Math.abs(t.startingTick), 0) / tokens.length
      : 0

  const stats = [
    { label: 'Total Tokens', value: tokens.length.toLocaleString(), color: 'text-accent-green' },
    { label: 'Avg Starting Tick', value: Math.round(avgTick).toLocaleString(), color: 'text-text-primary' },
    { label: 'Active Pools', value: tokens.filter(t => t.poolId).length.toLocaleString(), color: 'text-text-primary' },
    { label: 'Unique Deployers', value: new Set(tokens.map(t => t.msgSender)).size.toLocaleString(), color: 'text-text-primary' },
    { label: 'ETH Price', value: `$${ethPrice}`, sub: 'Base mainnet', color: 'text-text-primary' },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      <TickerTape />

      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <span className="text-accent-green font-bold text-lg">LQ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                LiquidDex<span className="text-accent-green">Scanner</span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot" />
                Base Chain
              </div>
            </div>
          </div>
          <a
            href="https://github.com/Liquid-Protocol-Ops/SDK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-accent-green transition-colors mono"
          >
            SDK ↗
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <NavTabs active={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          <StatsRow stats={stats} />
        </div>

        <div className="mt-6">
          {/* NEW TOKENS */}
          {activeTab === 'new' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-dot" />
                  New Tokens
                  <span className="text-sm text-text-muted font-normal mono">
                    ({tokens.length} deployed)
                  </span>
                </h2>
                <button
                  onClick={fetchTokens}
                  className="px-3 py-1.5 text-xs mono rounded-md bg-dark-border text-text-secondary hover:text-accent-green transition-colors"
                >
                  ↻ Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 text-text-muted">
                  <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Memuat token dari Liquid Protocol...
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-red-400 mb-3 mono text-sm">{error}</p>
                  <button
                    onClick={fetchTokens}
                    className="px-4 py-2 text-sm rounded-md bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-16 text-text-muted">
                  <p className="mono text-sm">Tidak ada token ditemukan dalam range block ini.</p>
                  <p className="text-xs mt-2 text-text-muted">
                    Cek console browser untuk detail error.
                  </p>
                </div>
              ) : (
                <TokenTable tokens={tokens as any} onSelect={handleTokenSelect as any} />
              )}
            </div>
          )}

          {/* TRENDING */}
          {activeTab === 'trending' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Trending Tokens</h2>
              <TrendingGrid tokens={tokens as any} onSelect={handleTokenSelect as any} />
              <h3 className="text-md font-semibold mb-3 mt-8 text-text-secondary">Top by Volume</h3>
              <TokenTable tokens={tokens as any} onSelect={handleTokenSelect as any} />
            </div>
          )}

          {/* CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-6">
              <PriceChart
                data={chartData}
                tokenName={selectedToken?.tokenName}
                tokenSymbol={selectedToken?.tokenSymbol}
              />
              {selectedToken && (
                <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                  <h3 className="text-lg font-semibold mb-4">Contract Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Token Address', value: selectedToken.tokenAddress },
                      { label: 'Pool ID', value: selectedToken.poolId },
                      { label: 'Hook', value: selectedToken.poolHook },
                      { label: 'Fee Locker', value: selectedToken.locker },
                      { label: 'Deployer', value: selectedToken.msgSender },
                      { label: 'MEV Module', value: selectedToken.mevModule },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-dark-bg rounded-lg">
                        <div className="text-xs text-text-muted mono uppercase mb-1">{item.label}</div>
                        <div className="mono text-xs text-text-secondary break-all">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="mt-12 py-6 border-t border-dark-border text-center text-sm text-text-muted">
          <p>
            Built with{' '}
            <a href="https://github.com/Liquid-Protocol-Ops/SDK" className="text-accent-green hover:underline">
              Liquid SDK
            </a>
            {' '}· Base Chain · Next.js · Uniswap V4
          </p>
        </footer>
      </main>
    </div>
  )
}
