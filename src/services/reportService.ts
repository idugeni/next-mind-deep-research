import type { Report } from "@/types/report"

export async function getReport(reportId: string): Promise<Report> {
  const response = await fetch(`/api/reports/${reportId}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch report")
  }
  const data = await response.json()
  return data.report
}

export async function getReports(): Promise<Report[]> {
  const response = await fetch("/api/reports")
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch reports")
  }
  const data = await response.json()
  return data.reports
}

export async function deleteReport(reportId: string): Promise<void> {
  const response = await fetch(`/api/reports/${reportId}`, { method: "DELETE" })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete report")
  }
}

export async function generateReport({ query, sources, model, language }: { query: string, sources: any[], model: string, language?: string }): Promise<{ reportId: string }> {
  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, sources, model, language })
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to generate report")
  }
  return await response.json()
}
