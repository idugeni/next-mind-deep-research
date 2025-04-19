import type { SearchResult } from '@/types/search';

export async function searchGoogle(query: string, language?: "id" | "en", safe: string = "off") {
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

  // Google CSE only returns max 10 per request, so we fetch up to 5 pages for max 50 results
  const urls = [];
  for (let i = 0; i < 5; i++) {
    const start = 1 + i * 10;
    urls.push(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10&start=${start}${params}&safe=${safe}`);
  }

  try {
    // Fetch up to 5 pages in parallel
    const responses = await Promise.all(urls.map(url => fetch(url)));
    const datas = await Promise.all(responses.map(async (res, idx) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `Google Search API request failed (page ${idx + 1})`);
      }
      return res.json();
    }));

    // Gabungkan semua items
    let items: SearchResult[] = [];
    for (const data of datas) {
      if (Array.isArray(data.items)) items.push(...data.items);
    }
    // Batasi maksimal 50 hasil
    items = items.slice(0, 50);
    return { ...datas[0], items };
  } catch (error) {
    // Error handled by caller/frontend
    throw error;
  }
}
