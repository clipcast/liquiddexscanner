export interface TokenEvent {
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
  blockNumber?: string | bigint
}
