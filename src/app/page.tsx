'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TokenEvent } from '@/lib/types'
import TickerTape from '@/components/TickerTape'
import NavTabs from '@/components/NavTabs'
import StatsRow from '@/components/StatsRow'
import TokenTable from '@/components/TokenTable'
import TrendingGrid from '@/components/TrendingGrid'
import PriceChart from '@/components/PriceChart'
import AuctionTable from '@/components/AuctionTable'
import VaultTable from '@/components/VaultTable'

export default function Home() {
  const [activeTab, setActiveTab] = useState('new')
  const [tokens, setTokens] = useState<TokenEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<TokenEvent | null>(null)
  const [auctionPoolId, setAuctionPoolId] = useState('')
  const [auctionState, setAuctionState] = useState<any>(null)
  const [vaultData, setVaultData] = useState<any>(null)
  const [airdropData, setAirdropData] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [ethPrice] = useState(2700)

  // Fetch all tokens
  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens')
      const json = await res.json()
      if (json.success) {
        setTokens((json.data || []).reverse())
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokens()
    const interval = setInterval(fetchTokens, 10000)
    return () => clearInterval(interval)
  }, [fetchTokens])

  // Fetch auction state
  const fetchAuction = useCallback(async (poolId: string) => {
    if (!poolId || !poolId.startsWith('0x')) return
    try {
      const res = await fetch(`/api/auction/${poolId}`)
      const json = await res.json()
      if (json.success) setAuctionState(json.data)
    } catch {}
  }, [])

  // Fetch vault + airdrop
  const fetchVaultAndAirdrop = useCallback(async (address: string) => {
    try {
      const res = await fetch(`/api/token/${address}`)
      const json = await res.json()
      if (json.success) {
        setVaultData(json.data.event)
        // Separate vault/airdrop from token info
        try {
          const { getVaultAllocation, getAirdropInfo } = await import('@/lib/liquid')
          // These are server-side; we'd need dedicated API routes for them
        } catch {}
      }
    } catch {}
  }, [])

  const handleTokenSelect = (token: TokenEvent) => {
    setSelectedToken(token)
    setActiveTab('chart')
    setAuctionPoolId(token.poolId)

    // Generate mock chart data based on startingTick
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

  // Stats summary
  const avgTick = tokens.length > 0
    ? tokens.reduce((s: number, t: TokenEvent) => s + Math.abs(t.startingTick), 0) / tokens.length
    : 0

  const stats = [
    { label: 'Total Tokens', value: tokens.length.toLocaleString(), color: 'text-accent-green' },
    { label: 'Avg Starting Tick', value: Math.round(avgTick).toLocaleString(), color: 'text-text-primary' },
    { label: 'Active Pools', value: tokens.filter((t: TokenEvent) => t.poolId).length.toLocaleString(), color: 'text-text-primary' },
    { label: 'Unique Deployers', value: new Set(tokens.map((t: TokenEvent) => t.msgSender)).size.toLocaleString(), color: 'text-text-primary' },
    { label: 'ETH Price', value: `$${ethPrice}`, sub: 'Base mainnet', color: 'text-text-primary' },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Ticker */}
      <TickerTape />

      {/* Top Bar */}
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
        {/* Nav Tabs */}
        <NavTabs active={activeTab} onChange={setActiveTab} />

        {/* Stats Row */}
        <div className="mt-6">
          <StatsRow stats={stats} />
        </div>

        {/* Tab Content */}
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
                <div className="flex gap-2">
                  {['1m', '5m', '1h', '6h'].map((f) => (
                    <button
                      key={f}
                      className="px-3 py-1.5 text-xs mono rounded-md bg-dark-border text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="text-center py-16 text-text-muted">
                  <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading tokens from Liquid Protocol...
                </div>
              ) : (
                <TokenTable tokens={tokens} onSelect={handleTokenSelect} />
              )}
            </div>
          )}

          {/* TRENDING */}
          {activeTab === 'trending' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Trending Tokens</h2>
              <TrendingGrid tokens={tokens} onSelect={handleTokenSelect} />
              <h3 className="text-md font-semibold mb-3 mt-8 text-text-secondary">
                Top by Volume
              </h3>
              <TokenTable tokens={tokens} onSelect={handleTokenSelect} />
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

          {/* SNIPER AUCTION */}
          {activeTab === 'auction' && (
            <div className="space-y-6">
              <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                <label className="block text-sm text-text-secondary mb-2">
                  Enter Pool ID to check auction state
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={auctionPoolId}
                    onChange={(e) => setAuctionPoolId(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-green/50"
                  />
                  <button
                    onClick={() => fetchAuction(auctionPoolId)}
                    className="px-6 py-2.5 bg-accent-green/10 border border-accent-green/30 rounded-lg text-accent-green mono text-sm hover:bg-accent-green/20 transition-colors"
                  >
                    Fetch
                  </button>
                </div>
                {selectedToken && (
                  <div className="mt-3 text-xs text-text-muted">
                    From selected token:{' '}
                    <button
                      onClick={() => setAuctionPoolId(selectedToken.poolId)}
                      className="text-accent-green hover:underline mono"
                    >
                      {selectedToken.poolId}
                    </button>
                  </div>
                )}
              </div>
              <AuctionTable state={auctionState} poolId={auctionPoolId} />
            </div>
          )}

          {/* VAULT & AIRDROP */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                <label className="block text-sm text-text-secondary mb-2">
                  Enter Token Address to check vault & airdrop
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={selectedToken?.tokenAddress || ''}
                    onChange={() => {}}
                    placeholder="0x..."
                    className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-green/50"
                  />
                  <button
                    onClick={() => selectedToken && fetchVaultAndAirdrop(selectedToken.tokenAddress)}
                    className="px-6 py-2.5 bg-accent-green/10 border border-accent-green/30 rounded-lg text-accent-green mono text-sm hover:bg-accent-green/20 transition-colors"
                  >
                    Fetch
                  </button>
                </div>
                {tokens.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tokens.slice(0, 5).map((t: TokenEvent) => (
                      <button
                        key={t.tokenAddress}
                        onClick={() => {
                          setSelectedToken(t)
                          fetchVaultAndAirdrop(t.tokenAddress)
                        }}
                        className="px-3 py-1 bg-dark-border rounded text-xs mono text-text-secondary hover:text-accent-green transition-colors"
                      >
                        {t.tokenSymbol}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <VaultTable
                vault={vaultData}
                airdrop={airdropData}
                tokenAddress={selectedToken?.tokenAddress}
              />
            </div>
          )}
        </div>

        {/* Footer */}
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
