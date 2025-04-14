import { load } from "cheerio"

export async function fetchUrlContent(url: string): Promise<string> {
  try {
    // Fetch the URL content with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://www.google.com/",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeoutId))

    // Handle different HTTP status codes
    if (!response.ok) {
      if (response.status === 403) {
        return `[Access Forbidden: The website at ${url} has restricted access to its content. Using available metadata only.]`
      } else {
        return `[Content unavailable from ${url}: HTTP status ${response.status} ${response.statusText}]`
      }
    }

    // Check content type to ensure we're dealing with HTML
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return `[Content from ${url} is not HTML (${contentType}). Using available metadata only.]`
    }

    const html = await response.text()

    // Use cheerio to parse the HTML and extract the main content
    const $ = load(html)

    // Remove script and style elements
    $("script, style, iframe, nav, footer, header, aside").remove()

    // Extract the title
    const title = $("title").text().trim() || "Untitled Page"

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || ""

    // Extract the main content
    // Try to find the main content container
    let mainContent = $("main").text() || $("article").text() || $("#content").text() || $(".content").text()

    // If no main content container is found, use the body
    if (!mainContent || mainContent.trim().length < 100) {
      // Get all paragraphs
      const paragraphs = $("p")
        .map((_, el) => $(el).text().trim())
        .get()
      mainContent = paragraphs.join("\n\n")
    }

    // If still no substantial content, try to get text from all visible elements
    if (!mainContent || mainContent.trim().length < 100) {
      mainContent = $("body").text().trim()
    }

    // Combine title, meta description, and content
    let extractedContent = `Title: ${title}\n\n`

    if (metaDescription) {
      extractedContent += `Description: ${metaDescription}\n\n`
    }

    extractedContent += `Content:\n${mainContent}`

    // Limit the content length to avoid overwhelming the LLM
    return extractedContent.slice(0, 10000)
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error)
    // Return a placeholder instead of throwing an error
    return `[Content unavailable from ${url}: ${error.message}]`
  }
}
