import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limiter"
import { fetchUrlContent } from "@/lib/fetch-content"
import { generateReportWithGemini } from "@/lib/gemini"
import { saveReport } from "@/lib/reports-store"

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
    const { query, selectedResults, model, language } = body

    if (!query || !selectedResults || !Array.isArray(selectedResults) || selectedResults.length === 0) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    // Validate model
    const validModels = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.5-pro-exp-03-25",
      "gemini-2.0-flash-thinking-exp-01-21",
    ]

    if (model && !validModels.includes(model)) {
      return NextResponse.json({ message: "Invalid model specified" }, { status: 400 })
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
        console.error(`Error processing content from ${result.link}:`, error)
        const fetchError = error as Error
        // Return the result with search snippet as fallback
        return {
          ...result,
          content: `[Content unavailable: ${fetchError.message}]

Search Result Snippet: ${result.snippet || "No snippet available"}

Title: ${result.title || "No title available"}`,
        }
      }
    })

    const resultsWithContent = await Promise.all(contentPromises)

    // Generate report using Gemini
    const report = await generateReportWithGemini(query, resultsWithContent, model || "gemini-2.5-pro-exp-03-25", language)

    // Save the report
    const savedReport = await saveReport(report)

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
    console.error("Report generation API error:", error)
    const errorMessage = error instanceof Error ? error.message : "An error occurred during report generation"
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    )
  }
}
