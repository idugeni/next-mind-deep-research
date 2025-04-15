import { NextResponse } from "next/server"
import { getAllReports } from "@/lib/reports-store"
import { toast } from "sonner"

export async function GET() {
  try {
    const reports = await getAllReports()

    return NextResponse.json({ reports })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";
    toast.error("Error fetching reports: " + message);
    return NextResponse.json(
      { message: message || "An error occurred while fetching reports" },
      { status: 500 }
    );
  }
}
