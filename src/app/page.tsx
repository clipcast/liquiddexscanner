'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchTokens } from '@/lib/api'
import type { TokenEvent } from '@/lib/types'
import NavTabs from '@/components/NavTabs'
import TokenTable from '@/components/TokenTable'

type PriceData = {
  price_usd: string | null
  market_cap_usd: string | null
  volume_usd_h24: string | null
}

export default function Home() {
  const [tokens, setTokens] = useState<TokenEvent[]>([])
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('new')

  const loadTokens = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTokens()
      if (!data || data.length === 0) throw new Error('Tidak ada token ditemukan')
      // Sort terbaru dulu berdasarkan blockNumber
      const sorted = [...data].sort(
        (a: TokenEvent, b: TokenEvent) =>
          Number(b.blockNumber ?? 0) - Number(a.blockNumber ?? 0)
      )
      setTokens(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat token')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch harga dari GeckoTerminal (20 token pertama)
  const loadPrices = useCallback(async (list: TokenEvent[]) => {
    const slice = list.slice(0, 20)
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
              price_usd: attr.price_usd ?? null,
              market_cap_usd: attr.market_cap_usd ?? null,
              volume_usd_h24: attr.volume_usd?.h24 ?? null,
            }
          }
        } catch { /* skip */ }
      })
    )

    setPrices(results)
  }, [])

  useEffect(() => {
    loadTokens()
    const interval = setInterval(loadTokens, 30_000)
    return () => clearInterval(interval)
  }, [loadTokens])

  useEffect(() => {
    if (tokens.length > 0) loadPrices(tokens)
  }, [tokens, loadPrices])

  // Tab new = 50 terbaru, all = semua
  const displayed = activeTab === 'new' ? tokens.slice(0, 50) : tokens

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Header */}
      <header className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-green/10 flex items-center justify-center">
            <span className="text-accent-green font-bold">⬡</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-text-primary">
              Liquid<span className="text-accent-green">Scanner</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              Base Chain · Liquid Protocol
            </div>
          </div>
        </div>
        <div className="text-xs text-text-muted mono">
          {tokens.length > 0 && `${tokens.length} tokens indexed`}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <NavTabs active={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
              <p className="text-text-muted text-sm">Memuat token dari Liquid Protocol...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="text-red-400 text-sm mono">{error}</p>
              <button
                onClick={loadTokens}
                className="px-4 py-2 bg-accent-green/10 text-accent-green rounded-lg text-sm hover:bg-accent-green/20 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <TokenTable
              tokens={displayed}
              prices={prices}
              onSelect={(token) => {
                window.open(
                  `https://app.liquidprotocol.org/tokens/${token.tokenAddress}`,
                  '_blank'
                )
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
