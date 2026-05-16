'use client'

interface VaultAllocation {
  token: string
  amountTotal: string
  amountClaimed: string
  lockupEndTime: string
  vestingEndTime: string
  admin: string
}

interface AirdropInfo {
  admin: string
  merkleRoot: string
  totalSupply: string
  totalClaimed: string
  lockupEndTime: string
  vestingEndTime: string
  adminClaimTime: string
  adminClaimed: boolean
}

interface VaultTableProps {
  vault: VaultAllocation | null
  airdrop: AirdropInfo | null
  tokenAddress?: string
}

function formatTimestamp(ts: string | bigint): string {
  const num = typeof ts === 'bigint' ? Number(ts) : Number(ts)
  if (!num || num === 0) return '-'
  const date = new Date(num * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatSupply(val: string | bigint): string {
  const num = typeof val === 'bigint' ? Number(val) : Number(val)
  if (!num) return '-'
  return (num / 1e18).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function VaultTable({ vault, airdrop, tokenAddress }: VaultTableProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vault Section */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green" />
          Vault Allocation
        </h3>

        {tokenAddress && (
          <div className="mb-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
            <div className="text-xs text-text-muted mono uppercase mb-1">Token</div>
            <div className="mono text-sm text-text-secondary break-all">{tokenAddress}</div>
          </div>
        )}

        {!vault ? (
          <div className="text-center py-12 text-text-muted">
            <p>No vault data</p>
            <p className="text-sm mt-1">Token may not have a vault extension</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Total Locked</div>
                <div className="mono text-lg font-bold text-text-primary">
                  {formatSupply(vault.amountTotal)}
                </div>
              </div>
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Claimed</div>
                <div className="mono text-lg font-bold text-accent-green">
                  {formatSupply(vault.amountClaimed)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Lockup Ends</div>
                <div className="mono text-sm text-text-secondary">
                  {formatTimestamp(vault.lockupEndTime)}
                </div>
              </div>
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Vesting Ends</div>
                <div className="mono text-sm text-text-secondary">
                  {formatTimestamp(vault.vestingEndTime)}
                </div>
              </div>
            </div>
            <div className="p-3 bg-dark-bg rounded-lg">
              <div className="text-xs text-text-muted mono uppercase mb-1">Admin</div>
              <div className="mono text-sm text-text-secondary break-all">{vault.admin}</div>
            </div>
          </div>
        )}
      </div>

      {/* Airdrop Section */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-buy" />
          Airdrop Info
        </h3>

        {!airdrop ? (
          <div className="text-center py-12 text-text-muted">
            <p>No airdrop data</p>
            <p className="text-sm mt-1">Token may not have an airdrop extension</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Total Supply</div>
                <div className="mono text-lg font-bold text-text-primary">
                  {formatSupply(airdrop.totalSupply)}
                </div>
              </div>
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Claimed</div>
                <div className="mono text-lg font-bold text-accent-green">
                  {formatSupply(airdrop.totalClaimed)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Lockup Ends</div>
                <div className="mono text-sm text-text-secondary">
                  {formatTimestamp(airdrop.lockupEndTime)}
                </div>
              </div>
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="text-xs text-text-muted mono uppercase mb-1">Vesting Ends</div>
                <div className="mono text-sm text-text-secondary">
                  {formatTimestamp(airdrop.vestingEndTime)}
                </div>
              </div>
            </div>
            <div className="p-3 bg-dark-bg rounded-lg">
              <div className="text-xs text-text-muted mono uppercase mb-1">Admin Claimed</div>
              <div className={`mono text-sm ${airdrop.adminClaimed ? 'text-accent-green' : 'text-yellow-400'}`}>
                {airdrop.adminClaimed ? 'Yes ✓' : 'Not yet'}
              </div>
            </div>
            <div className="p-3 bg-dark-bg rounded-lg">
              <div className="text-xs text-text-muted mono uppercase mb-1">Merkle Root</div>
              <div className="mono text-xs text-text-muted break-all">{airdrop.merkleRoot}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
