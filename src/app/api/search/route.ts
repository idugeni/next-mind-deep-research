import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limiter"
import { searchGoogle } from "@/lib/google-search"

export async function GET(request: NextRequest) {
  try {
    // Get the search query from the URL
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const language = searchParams.get("language") as "id" | "en" | undefined
    const safe = searchParams.get("safe") || "off";

    if (!query) {
      return NextResponse.json({ error: true, message: "Search query is required" }, { status: 200 })
    }

    // Apply rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    const { success, limit, remaining, reset } = await rateLimit(ip, "search", 10)

    if (!success) {
      return NextResponse.json(
        {
          error: true,
          message: "Rate limit exceeded. Please try again later.",
          limit,
          remaining,
          reset,
        },
        {
          status: 200,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      )
    }

    // Perform the search
    const searchResults = await searchGoogle(query, language, safe)

    return NextResponse.json(searchResults, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  } catch (error: unknown) {
    // Error logged for server, send message to client
    const errorMessage = error instanceof Error ? error.message : "An error occurred during search"
    return NextResponse.json({ error: true, message: errorMessage }, { status: 200 })
  }
}
