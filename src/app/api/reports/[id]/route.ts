import { type NextRequest, NextResponse } from "next/server"
import { getReportById, deleteReport } from "@/lib/reports-store"
import { toast } from "sonner"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: reportId } = await context.params

    if (!reportId) {
      return NextResponse.json({ message: "Report ID is required" }, { status: 400 })
    }

    const report = await getReportById(reportId)
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json(
      { message: (error instanceof Error ? error.message : "An error occurred while fetching the report") },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: reportId } = await context.params

    if (!reportId) {
      return NextResponse.json({ message: "Report ID is required" }, { status: 400 })
    }

    try {
      const report = await getReportById(reportId)
      if (!report) {
        return NextResponse.json({ message: "Report not found" }, { status: 404 })
      }

      await deleteReport(reportId)
      return NextResponse.json({ message: "Report deleted successfully" })
    } catch (error) {
      const reportError = error as Error
      toast.error(`Error deleting report: ${reportError.message}`)
      return NextResponse.json({ message: `Error deleting report: ${reportError.message}` }, { status: 500 })
    }
  } catch (error) {
    const err = error as Error
    toast.error("Error deleting report: " + err.message)
    return NextResponse.json(
      { message: err.message || "An error occurred while deleting the report" },
      { status: 500 },
    )
  }
}
