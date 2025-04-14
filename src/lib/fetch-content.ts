import { load } from "cheerio";
import axios, { AxiosError } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import UserAgent from "user-agents";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 15000; // 15 seconds

interface FetchOptions {
  proxy?: {
    type: "http" | "socks";
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
  timeout?: number;
  headers?: Record<string, string>;
  language?: "id" | "en";
}

async function fetchWithRetry(url: string, options: FetchOptions = {}, retryCount = 0): Promise<any> {
  try {
    const userAgent = new UserAgent().toString();
    const defaultHeaders = {
      "User-Agent": userAgent,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": options.language === "id" ? "id,en-US;q=0.7,en;q=0.3" : "en-US,en;q=0.5",
      "Referer": "https://www.google.com/",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    };

    let agent;
    if (options.proxy) {
      const { type, host, port, auth } = options.proxy;
      const proxyUrl = auth
        ? `${type}://${auth.username}:${auth.password}@${host}:${port}`
        : `${type}://${host}:${port}`;

      agent = type === "http"
        ? new HttpsProxyAgent(proxyUrl)
        : new SocksProxyAgent(proxyUrl);
    }

    const response = await axios({
      url,
      method: "GET",
      headers: { ...defaultHeaders, ...options.headers },
      timeout: options.timeout || TIMEOUT,
      httpsAgent: agent,
      validateStatus: null,
      maxRedirects: 5,
      decompress: true,
    });

    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Fetch error for ${url}:`, error.message);
      
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retryCount + 1);
      }
    }
    throw error;
  }
}

export async function fetchUrlContent(url: string, options: FetchOptions = {}): Promise<string> {
  try {
    const response = await fetchWithRetry(url, options);

    // Handle different HTTP status codes
    if (response.status !== 200) {
      if (response.status === 403) {
        return `[Access Forbidden: The website at ${url} has restricted access to its content. Using available metadata only.]`;
      } else {
        return `[Content unavailable from ${url}: HTTP status ${response.status} ${response.statusText}]`;
      }
    }

    // Check content type to ensure we're dealing with HTML
    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return `[Content from ${url} is not HTML (${contentType}). Using available metadata only.]`;
    }

    const html = response.data;

    // Use cheerio to parse the HTML and extract the main content
    const $ = load(html);

    // Remove script and style elements
    $("script, style, iframe, nav, footer, header, aside").remove();

    // Extract the title
    const title = $("title").text().trim() || "Untitled Page";

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";

    // Extract the main content
    // Try to find the main content container
    let mainContent = $("main").text() || $("article").text() || $("#content").text() || $(".content").text();

    // If no main content container is found, use the body
    if (!mainContent || mainContent.trim().length < 100) {
      // Get all paragraphs
      const paragraphs = $("p")
        .map((_, el) => $(el).text().trim())
        .get();
      mainContent = paragraphs.join("\n\n");
    }

    // If still no substantial content, try to get text from all visible elements
    if (!mainContent || mainContent.trim().length < 100) {
      mainContent = $("body").text().trim();
    }

    // Combine title, meta description, and content
    let extractedContent = `Title: ${title}\n\n`;

    if (metaDescription) {
      extractedContent += `Description: ${metaDescription}\n\n`;
    }

    extractedContent += `Content:\n${mainContent}`;

    // Limit the content length to avoid overwhelming the LLM
    return extractedContent.slice(0, 10000);
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return `[Content unavailable from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}
