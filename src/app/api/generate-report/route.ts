import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limiter"
import { fetchUrlContent } from "@/lib/fetch-content"
import { generateReportWithGemini } from "@/lib/gemini"
import { saveReport, getReportById } from "@/lib/reports-store"
import { DEFAULT_MODEL_ID } from "@/constants/models"
import redis from "@/lib/redis"
import { REPORTS_LIST_KEY } from "@/constants/redis-keys"

const useBackendApiKey = process.env.USE_BACKEND_API_KEY === 'true'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const { success, limit, remaining, reset } = await rateLimit(ip, "generate", 5)

    if (!success) {
      return NextResponse.json(
        {
          message: "Rate limit exceeded. Please try again later.",
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      )
    }

    // Get request body
    const body = await request.json()
    const { query, selectedResults, model, language, apiKey } = body

    if (!query || !selectedResults || !Array.isArray(selectedResults) || selectedResults.length === 0) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    // Validate model
    const validModels = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash-thinking-exp-01-21",
      "gemini-2.5-flash-preview-04-17",
      "gemini-2.5-pro-exp-03-25",
    ]

    if (model && !validModels.includes(model)) {
      return NextResponse.json({ message: "Invalid model specified" }, { status: 400 })
    }

    // Pilih API key sesuai mode
    const geminiApiKey = useBackendApiKey
      ? process.env.GEMINI_API_KEY
      : apiKey;
    if (!geminiApiKey || geminiApiKey.trim().length < 20) {
      return NextResponse.json({ message: "Gemini API key is not configured" }, { status: 400 });
    }

    // Fetch content from selected URLs
    const contentPromises = selectedResults.map(async (result) => {
      try {
        // Try to fetch the content
        const content = await fetchUrlContent(result.link)

        // Check if content is an error message
        const isErrorContent = content.startsWith("[Content unavailable") || content.startsWith("[Access Forbidden")

        // If we couldn't get the content, use the snippet from search results
        if (isErrorContent) {
          return {
            ...result,
            content: `${content}\n\nSearch Result Snippet: ${result.snippet || "No snippet available"}\n\nTitle: ${result.title || "No title available"}`,
          }
        }

        return {
          ...result,
          content,
        }
      } catch (error) {
        // Error logged for server, send message to client
        return {
          ...result,
          content: `[Content unavailable: ${error instanceof Error ? error.message : String(error)}]

Search Result Snippet: ${result.snippet || "No snippet available"}

Title: ${result.title || "No title available"}`,
        }
      }
    })

    const resultsWithContent = await Promise.all(contentPromises)

    // Proses generate report bisa lama, set timeout fetchWithTimeout jadi 60 detik
    const report = await generateReportWithGemini(
      query,
      resultsWithContent,
      model || DEFAULT_MODEL_ID,
      language,
      geminiApiKey // gunakan key hasil seleksi
    )

    // Simpan report ke database
    const savedReport = await saveReport(report)

    // Pastikan report benar-benar sudah tersimpan dan bisa diambil, dan ID sudah masuk list (hindari race condition Redis)
    let persistedReport = null
    let idInList = false
    let retry = 0
    const maxRetries = 10
    const retryDelayMs = 100
    while (retry < maxRetries) {
      persistedReport = await getReportById(report.id)
      const reportIds = await redis.lrange(REPORTS_LIST_KEY, 0, -1)
      idInList = reportIds.includes(report.id)
      if (persistedReport && idInList) break
      await new Promise(res => setTimeout(res, retryDelayMs))
      retry++
    }
    if (!persistedReport || !idInList) {
      return NextResponse.json({ message: "Report failed to persist. Please try again." }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Report generated successfully",
        reportId: savedReport.id,
      },
      {
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    )
  } catch (error: unknown) {
    // Error logged for server, send message to client
    const errorMessage = error instanceof Error ? error.message : "An error occurred during report generation"
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    )
  }
}
