'use client'

import { useEffect, useState, useCallback } from 'react'

// Tipe dari SDK Liquid Protocol
type Token = {
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  tokenImage: string
  poolId: string
  msgSender: string
  blockNumber: bigint | number | string
  startingTick: number
  // field lain dari SDK
  [key: string]: any
}

// Data harga dari GeckoTerminal
type PriceData = {
  price_usd: string
  market_cap_usd: string
  volume_usd_h24: string
}

// Format angka ke readable
function formatUSD(val: string | number | null | undefined): string {
  const n = parseFloat(String(val || '0'))
  if (!n || isNaN(n)) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  if (n < 0.000001) return `$${n.toExponential(2)}`
  return `$${n.toFixed(6)}`
}

// Hitung AGE dari blockNumber
function formatAge(blockNumber: string | number): string {
  // Base avg 2 detik per block
  const currentBlock = 46_500_000 // estimasi block sekarang
  const diff = currentBlock - Number(blockNumber)
  const seconds = diff * 2
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

// Potong address untuk tampilan
function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'new' | 'all'>('new')
  const [search, setSearch] = useState('')

  // Fetch semua token dari API kita
  const fetchTokens = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/tokens', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'API failed')
      const list: Token[] = json.data || []
      setTokens(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat token')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch harga dari GeckoTerminal untuk batch token
  const fetchPrices = useCallback(async (tokenList: Token[]) => {
    // GeckoTerminal: fetch per token address, Base network = "base"
    // Batasi 20 token pertama agar tidak spam API
    const slice = tokenList.slice(0, 20)
    const results: Record<string, PriceData> = {}

    await Promise.allSettled(
      slice.map(async (token) => {
        try {
          const res = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/base/tokens/${token.tokenAddress}`,
            { headers: { Accept: 'application/json;version=20230302' } }
          )
          if (!res.ok) return
          const json = await res.json()
          const attr = json?.data?.attributes
          if (attr) {
            results[token.tokenAddress] = {
              price_usd: attr.price_usd,
              market_cap_usd: attr.market_cap_usd,
              volume_usd_h24: attr.volume_usd?.h24,
            }
          }
        } catch {
          // skip token yang gagal
        }
      })
    )

    setPrices(results)
  }, [])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  useEffect(() => {
    if (tokens.length > 0) {
      fetchPrices(tokens)
    }
  }, [tokens, fetchPrices])

  // Filter berdasarkan tab dan search
  const displayed = (() => {
    let list = [...tokens]

    // NEW = sort by blockNumber desc (terbaru dulu)
    // ALL = sort by blockNumber desc juga, tapi tampilkan semua
    list.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))

    if (activeTab === 'new') {
      list = list.slice(0, 50) // 50 terbaru
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.tokenName.toLowerCase().includes(q) ||
          t.tokenSymbol.toLowerCase().includes(q) ||
          t.tokenAddress.toLowerCase().includes(q)
      )
    }

    return list
  })()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono">
      {/* Header */}
      <header className="border-b border-[#1f1f1f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-bold text-xl">⬡ LiquidScanner</span>
          <span className="text-xs text-gray-500 bg-[#111] px-2 py-1 rounded">Base Chain</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {tokens.length} tokens indexed
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-[#1f1f1f]">
          {(['new', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'new' ? '🆕 New Tokens' : '📋 All Tokens'}
            </button>
          ))}

          {/* Search */}
          <div className="ml-auto mb-2">
            <input
              type="text"
              placeholder="Search name / symbol / address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-green-500 w-72"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Memuat token dari Liquid Protocol...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchTokens}
              className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1f1f1f]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-gray-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Token</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">MC</th>
                  <th className="text-right px-4 py-3">Vol 24H</th>
                  <th className="text-right px-4 py-3">Age</th>
                  <th className="text-right px-4 py-3">Deployer</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-600">
                      Tidak ada token ditemukan
                    </td>
                  </tr>
                ) : (
                  displayed.map((token, i) => {
                    const p = prices[token.tokenAddress]
                    return (
                      <tr
                        key={token.tokenAddress}
                        className="border-b border-[#131313] hover:bg-[#111] transition-colors cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://app.liquidprotocol.org/tokens/${token.tokenAddress}`,
                            '_blank'
                          )
                        }
                      >
                        <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {token.tokenImage ? (
                              <img
                                src={token.tokenImage}
                                alt={token.tokenSymbol}
                                className="w-8 h-8 rounded-full object-cover bg-[#1a1a1a]"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 text-xs font-bold">
                                {token.tokenSymbol?.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">
                                {token.tokenName}
                                <span className="ml-2 text-xs text-gray-500">${token.tokenSymbol}</span>
                              </div>
                              <div className="text-xs text-gray-600">{shortAddr(token.tokenAddress)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p ? (
                            <span className="text-white">{formatUSD(p.price_usd)}</span>
                          ) : (
                            <span className="text-gray-600 text-xs">loading...</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p ? (
                            <span className="text-gray-300">{formatUSD(p.market_cap_usd)}</span>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p ? (
                            <span className="text-gray-300">{formatUSD(p.volume_usd_h24)}</span>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {formatAge(String(token.blockNumber))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`https://basescan.org/address/${token.msgSender}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-500 hover:text-green-400 text-xs"
                          >
                            {shortAddr(token.msgSender)}
                          </a>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          Data dari{' '}
          <a href="https://app.liquidprotocol.org" className="text-green-500 hover:underline">
            Liquid Protocol
          </a>{' '}
          · Harga dari GeckoTerminal · Base Chain
        </div>
      </main>
    </div>
  )
}
