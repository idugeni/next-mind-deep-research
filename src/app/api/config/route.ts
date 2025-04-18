import { NextResponse } from "next/server";

// Endpoint config: expose useBackendApiKey status to frontend
export async function GET() {
  const useBackendApiKey = process.env.USE_BACKEND_API_KEY === "true";
  return NextResponse.json({ useBackendApiKey });
}
