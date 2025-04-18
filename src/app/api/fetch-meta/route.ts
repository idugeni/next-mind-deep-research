import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

async function fetchMeta(url: string) {
  let title = "";
  let description = "";
  try {
    if (!/^https?:\/\//.test(url)) return { url, title: null, description: null };
    const response = await axios.get(url, { timeout: 4000 }); // timeout lebih ketat
    const html = response.data;
    const $ = cheerio.load(html);
    // Title
    title = $("title").first().text().trim();
    if (!title) title = $('meta[property="og:title"]').attr('content')?.trim() || '';
    // Description
    description = $('meta[name="description"]').attr('content')?.trim() || '';
    if (!description) description = $('meta[property="og:description"]').attr('content')?.trim() || '';
    if (!description) {
      const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
      description = paragraphs.find(p => p.length > 40) || '';
    }
  } catch {}
  return { url, title: title || null, description: description || null };
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: "Invalid request: urls must be array" }, { status: 400 });
    }
    // Limit batch to 20 for safety
    const limitedUrls = urls.slice(0, 20);
    const results = await Promise.all(limitedUrls.map(fetchMeta));
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to fetch meta" }, { status: 500 });
  }
}
