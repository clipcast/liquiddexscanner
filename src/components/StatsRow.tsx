'use client'

interface Stat {
  label: string
  value: string
  sub?: string
  color?: string
}

export default function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-dark-card rounded-xl border border-dark-border p-4"
        >
          <div className="text-text-mono text-xs mono text-text-secondary mb-1">
            {s.label}
          </div>
          <div className={`text-xl font-bold ${s.color || 'text-text-primary'}`}>
            {s.value}
          </div>
          {s.sub && (
            <div className="text-xs text-text-muted mt-1">{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  )
}
