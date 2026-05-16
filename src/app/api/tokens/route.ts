import { NextResponse } from 'next/server'
import { getAllTokens } from '@/lib/liquid'

export const dynamic = 'force-dynamic'
export const revalidate = 10

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deployer = searchParams.get('deployer') || undefined

  try {
    const tokens = await getAllTokens()
    return NextResponse.json({
      success: true,
      count: tokens.length,
      data: tokens,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tokens'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
