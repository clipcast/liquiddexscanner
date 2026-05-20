export async function fetchTokens() {
  try {
    const res = await fetch('/api/tokens', { cache: 'no-store' })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API failed')
    return json.data || []  // ✅ fix: json.data bukan json.tokens
  } catch (err) {
    console.error('fetchTokens error:', err)
    return []
  }
}
