'use client'

interface AuctionState {
  nextAuctionBlock: string
  round: string
  gasPeg: string
  currentFee: number
}

interface AuctionTableProps {
  state: AuctionState | null
  poolId?: string
}

function getStatus(fee: number, round: string): string {
  if (round === '0' || round === '0n') return 'Finished'
  if (fee > 0) return 'Active'
  return 'Cooldown'
}

export default function AuctionTable({ state, poolId }: AuctionTableProps) {
  if (!state) {
    return (
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <div className="text-center py-12 text-text-muted">
          <p className="mb-2">Enter a Pool ID to view auction state</p>
          <p className="text-sm">Pool IDs are 0x-prefixed hex strings from token events</p>
        </div>
      </div>
    )
  }

  const status = getStatus(state.currentFee, state.round)
  const statusColor =
    status === 'Active'
      ? 'text-accent-green'
      : status === 'Cooldown'
      ? 'text-yellow-400'
      : 'text-text-muted'

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Sniper Auction State</h3>
        <span className={`flex items-center gap-2 mono text-sm ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${
            status === 'Active' ? 'bg-accent-green animate-pulse-dot' :
            status === 'Cooldown' ? 'bg-yellow-400' : 'bg-text-muted'
          }`} />
          {status}
        </span>
      </div>

      {poolId && (
        <div className="mb-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
          <div className="text-xs text-text-muted mono uppercase mb-1">Pool ID</div>
          <div className="mono text-sm text-text-secondary break-all">{poolId}</div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-dark-bg rounded-lg">
          <div className="text-xs text-text-muted mono uppercase mb-1">Current Round</div>
          <div className="mono text-xl font-bold text-accent-green">
            {state.round?.toString() || '-'}
          </div>
        </div>
        <div className="p-4 bg-dark-bg rounded-lg">
          <div className="text-xs text-text-muted mono uppercase mb-1">Fee</div>
          <div className="mono text-xl font-bold text-text-primary">
            {(state.currentFee / 10000).toFixed(1)}%
          </div>
        </div>
        <div className="p-4 bg-dark-bg rounded-lg">
          <div className="text-xs text-text-muted mono uppercase mb-1">Gas Peg</div>
          <div className="mono text-xl font-bold text-text-primary">
            {state.gasPeg?.toString() || '-'}
          </div>
        </div>
        <div className="p-4 bg-dark-bg rounded-lg">
          <div className="text-xs text-text-muted mono uppercase mb-1">Next Auction</div>
          <div className="mono text-xl font-bold text-text-primary">
            {state.nextAuctionBlock?.toString() || '-'}
          </div>
        </div>
      </div>
    </div>
  )
}
