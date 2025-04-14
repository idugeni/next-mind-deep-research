import { type NextRequest, NextResponse } from "next/server"
import { getReportById } from "@/lib/reports-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id

    if (!reportId) {
      return NextResponse.json({ message: "Report ID is required" }, { status: 400 })
    }

    try {
      const report = await getReportById(reportId)

      if (!report) {
        return NextResponse.json({ message: "Report not found" }, { status: 404 })
      }

      return NextResponse.json({ report })
    } catch (reportError) {
      console.error(`Error retrieving report ${reportId}:`, reportError)
      return NextResponse.json({ message: `Error retrieving report: ${reportError.message}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Get report API error:", error)
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching the report" },
      { status: 500 },
    )
  }
}
