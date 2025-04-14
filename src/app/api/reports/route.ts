import { NextResponse } from "next/server"
import { getAllReports } from "@/lib/reports-store"
import { toast } from "sonner"

export async function GET() {
  try {
    const reports = await getAllReports()

    return NextResponse.json({ reports })
  } catch (error) {
    toast.error("Error fetching reports: " + error.message)
    return NextResponse.json({ message: error.message || "An error occurred while fetching reports" }, { status: 500 })
  }
}
