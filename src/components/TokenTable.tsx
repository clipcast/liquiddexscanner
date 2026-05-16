'use client'

interface TokenEvent {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  tokenImage: string
  startingTick: number
  poolHook: string
  poolId: string
  msgSender: string
  locker: string
  pairedToken: string
  mevModule: string
  extensions: string[]
  blockNumber?: string
}

export default function TokenTable({
  tokens,
  onSelect,
}: {
  tokens: TokenEvent[]
  onSelect?: (token: TokenEvent) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-border text-text-muted mono text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-2">#</th>
            <th className="text-left py-3 px-2">Token</th>
            <th className="text-right py-3 px-2">Starting Tick</th>
            <th className="text-right py-3 px-2">Pool</th>
            <th className="text-right py-3 px-2">Hook</th>
            <th className="text-right py-3 px-2">Block</th>
            <th className="text-right py-3 px-2">Deployer</th>
          </tr>
        </thead>
        <tbody>
          {tokens.slice(0, 50).map((token, i) => (
            <tr
              key={token.tokenAddress}
              onClick={() => onSelect?.(token)}
              className="border-b border-dark-border/50 hover:bg-dark-card/50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-2 text-text-muted mono">{i + 1}</td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center text-xs text-accent-green font-bold uppercase">
                    {token.tokenSymbol?.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {token.tokenName}
                    </div>
                    <div className="mono text-xs text-text-secondary">
                      {token.tokenSymbol}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-right mono text-text-secondary">
                {token.startingTick?.toLocaleString()}
              </td>
              <td className="py-3 px-2 text-right mono text-xs text-text-muted">
                {token.poolId?.slice(0, 10)}...
              </td>
              <td className="py-3 px-2 text-right">
                <span className="mono text-xs bg-dark-border px-2 py-0.5 rounded text-text-secondary">
                  {token.poolHook?.slice(0, 8)}...
                </span>
              </td>
              <td className="py-3 px-2 text-right mono text-text-muted">
                {token.blockNumber?.toString() || '-'}
              </td>
              <td className="py-3 px-2 text-right">
                <span className="mono text-xs text-text-muted">
                  {token.msgSender?.slice(0, 6)}...{token.msgSender?.slice(-4)}
                </span>
              </td>
            </tr>
          ))}
          {tokens.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-text-muted">
                No tokens found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
