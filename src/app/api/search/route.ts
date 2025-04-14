import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limiter"
import { searchGoogle } from "@/lib/google-search"

export async function GET(request: NextRequest) {
  try {
    // Get the search query from the URL
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ message: "Search query is required" }, { status: 400 })
    }

    // Apply rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const { success, limit, remaining, reset } = await rateLimit(ip, "search", 10)

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

    // Perform the search
    const searchResults = await searchGoogle(query)

    return NextResponse.json(searchResults, {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ message: error.message || "An error occurred during search" }, { status: 500 })
  }
}
