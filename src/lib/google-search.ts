export async function searchGoogle(query: string, language?: "id" | "en") {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const cx = process.env.GOOGLE_SEARCH_CX

  if (!apiKey || !cx) {
    throw new Error("Google Search API credentials are not configured")
  }

  // Compose language params for Google Custom Search API
  let params = ""
  if (language === "id") {
    params += "&lr=lang_id&hl=id&gl=ID"
  } else if (language === "en") {
    params += "&lr=lang_en&hl=en&gl=US"
  }

  // Google CSE only returns max 10 per request, so fetch twice for 20 results if needed
  const url1 = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10&start=1${params}`
  const url2 = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10&start=11${params}`

  try {
    const [response1, response2] = await Promise.all([
      fetch(url1),
      fetch(url2)
    ])

    if (!response1.ok) {
      const errorData = await response1.json()
      throw new Error(errorData.error?.message || "Google Search API request failed (page 1)")
    }
    if (!response2.ok) {
      const errorData = await response2.json()
      throw new Error(errorData.error?.message || "Google Search API request failed (page 2)")
    }

    const data1 = await response1.json()
    const data2 = await response2.json()

    // Gabungkan items jika ada
    const items = [...(data1.items || []), ...(data2.items || [])]
    // Copy properti lain dari data1, tapi ganti items
    return { ...data1, items }
  } catch (error) {
    // Error handled by caller/frontend
    throw error
  }
}
