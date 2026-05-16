'use client'

import { useEffect, useState } from 'react'

interface TickerItem {
  symbol: string
  name: string
  change: number
  address: string
}

export default function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    async function fetchTop() {
      try {
        const res = await fetch('/api/tokens')
        const json = await res.json()
        if (json.success) {
          const list: TickerItem[] = json.data
            .slice(0, 20)
            .map((t: any) => ({
              symbol: t.tokenSymbol,
              name: t.tokenName,
              change: Math.random() * 20 - 10, // placeholder
              address: t.tokenAddress,
            }))
          setItems(list)
        }
      } catch {}
    }
    fetchTop()
    const interval = setInterval(fetchTop, 30000)
    return () => clearInterval(interval)
  }, [])

  if (items.length === 0) return null

  const doubled = [...items, ...items]

  return (
    <div className="w-full overflow-hidden bg-dark-card border-b border-dark-border py-2">
      <div className="flex animate-ticker whitespace-nowrap gap-8">
        {doubled.map((item, i) => (
          <span key={`${item.address}-${i}`} className="inline-flex items-center gap-2 mono text-sm">
            <span className="text-text-secondary">{item.symbol}</span>
            <span className={item.change >= 0 ? 'text-accent-green' : 'text-red-bid'}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            <span className="text-text-muted mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
