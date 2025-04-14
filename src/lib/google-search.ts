export async function searchGoogle(query: string) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const cx = process.env.GOOGLE_SEARCH_CX

  if (!apiKey || !cx) {
    throw new Error("Google Search API credentials are not configured")
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Google Search API request failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Google Search API error:", error)
    throw error
  }
}
