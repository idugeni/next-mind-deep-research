// ---
// Sitemap route handler untuk Next.js 14/15+ App Router
// - 100% kompatibel dengan fetch no-store, Redis, Upstash, dsb.
// - Sitemap tetap valid dan SEO friendly
// - WAJIB: export const dynamic = "force-dynamic"
// ---

import { NextResponse } from "next/server";
import { getAllReports } from "@/lib/reports-store";

export const dynamic = "force-dynamic"; // WAJIB agar Next.js tidak mencoba SSG/ISR

export async function GET() {
  const baseUrl = "https://nextmind.oldsoul.id";
  const staticPaths = ["", "/reports"];

  let reports: { id: string; updatedAt?: string | Date }[] = [];

  try {
    reports = await getAllReports();
  } catch (error) {
    // Sitemap tetap bisa diakses meski data dinamis gagal
    console.error("❌ Failed to fetch reports for sitemap:", error);
  }

  const staticEntries = staticPaths.map(
    (path) => `\n    <url>\n      <loc>${baseUrl}${path}</loc>\n      <changefreq>weekly</changefreq>\n      <priority>${path === "" ? "1.0" : "0.9"}</priority>\n      <lastmod>${new Date().toISOString()}</lastmod>\n    </url>`
  );

  const dynamicEntries = reports.map(
    (r) => `\n    <url>\n      <loc>${baseUrl}/reports/${r.id}</loc>\n      <changefreq>monthly</changefreq>\n      <priority>0.8</priority>\n      <lastmod>${r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString()}</lastmod>\n    </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries.join("")}${dynamicEntries.join("")}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
