export async function fetchTokens() {
  try {
    const res = await fetch('/api/tokens', {
      cache: 'no-store',
    })

    const json = await res.json()

    if (!json.success) {
      throw new Error('API failed')
    }

    return json.tokens || []
  } catch (err) {
    console.error('fetchTokens error:', err)
    return []
  }
}
