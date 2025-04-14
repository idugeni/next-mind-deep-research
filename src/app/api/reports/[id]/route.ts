import { type NextRequest, NextResponse } from "next/server"
import { getReportById } from "@/lib/reports-store"
import { toast } from "sonner"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const reportId = (await context.params).id

    if (!reportId) {
      return NextResponse.json({ message: "Report ID is required" }, { status: 400 })
    }

    try {
      const report = await getReportById(reportId)

      if (!report) {
        return NextResponse.json({ message: "Report not found" }, { status: 404 })
      }

      return NextResponse.json({ report })
    } catch (error) {
      const reportError = error as Error
      toast.error(`Error retrieving report: ${reportError.message}`)
      return NextResponse.json({ message: `Error retrieving report: ${reportError.message}` }, { status: 500 })
    }
  } catch (error) {
    const err = error as Error
    toast.error("Error fetching report: " + err.message)
    return NextResponse.json(
      { message: err.message || "An error occurred while fetching the report" },
      { status: 500 },
    )
  }
}
