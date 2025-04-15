import { load } from "cheerio";
import axios, { AxiosError, AxiosResponse } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import UserAgent from "user-agents";
import https from "https";

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

async function fetchWithRetry(url: string, options: FetchOptions = {}, retryCount = 0): Promise<string> {
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
    } else {
      // Tambahkan agent untuk mengabaikan verifikasi SSL (hanya untuk development/testing)
      agent = new https.Agent({ rejectUnauthorized: false });
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

    if (response && typeof response === 'object' && 'data' in response) {
      // AxiosResponse
      return response.data;
    } else {
      // Fetch Response or error string
      if (typeof response === 'object' && response !== null && 'ok' in response && 'headers' in response) {
        const res = response as Response;
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await res.json();
        } else {
          return await res.text();
        }
      } else {
        // response is likely a string (error message)
        return typeof response === 'string' ? response : `[Content unavailable from ${url}: Unknown response type]`;
      }
    }
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

    if (response && typeof response === 'object' && 'data' in response) {
      // AxiosResponse
      const axiosResponse = response as AxiosResponse;
      if (axiosResponse.status !== 200) {
        if (axiosResponse.status === 403) {
          return `[Access Forbidden: The website at ${url} has restricted access to its content. Using available metadata only.]`;
        } else {
          return `[Content unavailable from ${url}: HTTP status ${axiosResponse.status} ${axiosResponse.statusText}]`;
        }
      }

      // Check content type to ensure we're dealing with HTML
      const contentType = axiosResponse.headers["content-type"] || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        return `[Content from ${url} is not HTML (${contentType}). Using available metadata only.]`;
      }

      const html = axiosResponse.data;

      // Use cheerio to parse the HTML and extract the main content
      const $ = load(html);

      // Remove script and style elements
      $("script, style, iframe, nav, footer, header, aside").remove();

      // Hilangkan elemen yang mengganggu sebelum ekstraksi konten utama
      ["sidebar", "ads", "promo", "newsletter", "cookie", "popup", "subscribe", "banner", "related", "share", "comment"].forEach(cls => {
        $(`[class*='${cls}'], [id*='${cls}']`).remove();
      });

      // Extract the title
      const title = $("title").text().trim() || "Untitled Page";

      // Extract meta description
      const metaDescription =
        $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";

      // Ambil gambar utama (og:image atau img pertama)
      const ogImage = $('meta[property="og:image"]').attr("content") || $("img").first().attr("src") || "";
      // Ambil tanggal publikasi jika ada
      const pubDate = $('meta[property="article:published_time"]').attr("content") || $("time").attr("datetime") || "";

      // Tambahkan selector lain yang umum
      let mainContent =
        $("main").text() ||
        $("article").text() ||
        $("#content").text() ||
        $(".content").text() ||
        $(".post").text() ||
        $(".entry-content").text() ||
        $(".blog-post").text();

      // Tambahkan heading di awal konten
      const heading = $("h1").first().text().trim();
      if (heading && mainContent && !mainContent.includes(heading)) {
        mainContent = heading + "\n\n" + mainContent;
      }

      // Jika tidak ada main content container, gunakan paragraf
      if (!mainContent || mainContent.trim().length < 100) {
        const paragraphs = $("p")
          .map((_, el) => $(el).text().trim())
          .get();
        mainContent = paragraphs.join("\n\n");
      }

      // Jika masih belum cukup, ambil seluruh body
      if (!mainContent || mainContent.trim().length < 100) {
        mainContent = $("body").text().trim();
      }

      // Gabungkan hasil ekstraksi
      let extractedContent = `Title: ${title}\n\n`;
      if (metaDescription) {
        extractedContent += `Description: ${metaDescription}\n\n`;
      }
      if (ogImage) {
        extractedContent += `Image: ${ogImage}\n\n`;
      }
      if (pubDate) {
        extractedContent += `Published: ${pubDate}\n\n`;
      }
      extractedContent += `Content:\n${mainContent}`;
      return extractedContent.slice(0, 10000);
    } else {
      // Fetch Response or error string
      if (typeof response === 'object' && response !== null && 'ok' in response && 'headers' in response) {
        const res = response as Response;
        if (!res.ok) {
          return `[Content unavailable from ${url}: HTTP error! status: ${res.status}]`;
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await res.json();
          return typeof json === 'string' ? json : JSON.stringify(json);
        } else {
          return await res.text();
        }
      } else {
        // response is likely a string (error message)
        return typeof response === 'string' ? response : `[Content unavailable from ${url}: Unknown response type]`;
      }
    }
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return `[Content unavailable from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}
