'use client'

export default function NavTabs({
  active,
  onChange,
}: {
  active: string
  onChange: (tab: string) => void
}) {
  const tabs = [
    { id: 'new', label: 'New Tokens' },
    { id: 'trending', label: 'Trending' },
    { id: 'chart', label: 'Chart' },
    { id: 'auction', label: 'Sniper Auction' },
    { id: 'vault', label: 'Vault & Airdrop' },
  ]

  return (
    <div className="flex gap-1 bg-dark-card rounded-lg p-1 border border-dark-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-accent-green/10 text-accent-green shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-dark-border/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
