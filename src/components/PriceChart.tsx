'use client'

import type { TooltipProps } from 'recharts'
// @ts-ignore recharts types incompatible with React 18 strict mode
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PricePoint {
  time: string
  price: number
}

export default function PriceChart({
  data,
  tokenName,
  tokenSymbol,
}: {
  data: PricePoint[]
  tokenName?: string
  tokenSymbol?: string
}) {
  if (data.length === 0) {
    return (
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Select a token to view chart</p>
          <p className="text-sm">Click any token from the New or Trending tab</p>
        </div>
      </div>
    )
  }

  const latestPrice = data[data.length - 1]?.price || 0
  const firstPrice = data[0]?.price || 0
  const change = firstPrice > 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {tokenName || 'Token'}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-bold mono text-text-primary">
              ${latestPrice.toFixed(6)}
            </span>
            <span
              className={`mono text-sm px-2 py-0.5 rounded ${
                change >= 0
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'bg-red-bid/10 text-red-bid'
              }`}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {['1h', '4h', '1d', '1w'].map((period) => (
            <button
              key={period}
              className="px-3 py-1.5 text-xs mono rounded-md bg-dark-border text-text-secondary hover:text-text-primary transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e68c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00e68c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'Space Mono' }}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'Space Mono' }}
              tickFormatter={(v: number) => `$${v.toFixed(4)}`}
            />
            <Tooltip
              contentStyle={{
                background: '#0f1519',
                border: '1px solid #1a2228',
                borderRadius: '8px',
                color: '#e8edf0',
                fontFamily: 'Space Mono',
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#00e68c"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}