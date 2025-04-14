import { NextResponse } from "next/server"
import { getAllReports } from "@/lib/reports-store"

export async function GET() {
  try {
    const reports = await getAllReports()

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Get reports API error:", error)
    return NextResponse.json({ message: error.message || "An error occurred while fetching reports" }, { status: 500 })
  }
}
