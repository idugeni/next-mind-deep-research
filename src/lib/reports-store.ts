import redis from "./redis"
import { Report } from "../types/report";

// Key for storing the list of report IDs
const REPORTS_LIST_KEY = "nextmind:reports:list"

// Prefix for storing individual reports
const REPORT_PREFIX = "nextmind:report:"

// Maximum number of reports to keep
const MAX_REPORTS = 50

function isValidReport(obj: unknown): obj is Report {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).id === "string" &&
    typeof (obj as Record<string, unknown>).title === "string" &&
    typeof (obj as Record<string, unknown>).query === "string" &&
    typeof (obj as Record<string, unknown>).summary === "string" &&
    typeof (obj as Record<string, unknown>).introduction === "string" &&
    typeof (obj as Record<string, unknown>).analysis === "string" &&
    typeof (obj as Record<string, unknown>).conclusion === "string" &&
    Array.isArray((obj as Record<string, unknown>).references) &&
    typeof (obj as Record<string, unknown>).createdAt === "string" &&
    typeof (obj as Record<string, unknown>).model === "string"
  );
}

export async function saveReport(report: Report): Promise<Report> {
  try {
    // Ensure we're storing a JSON string
    const reportJson = typeof report === "string" ? report : JSON.stringify(report)

    // Save the report
    await redis.set(`${REPORT_PREFIX}${report.id}`, reportJson)

    // Add the report ID to the list
    await redis.lpush(REPORTS_LIST_KEY, report.id)

    // Trim the list to keep only the most recent reports
    await redis.ltrim(REPORTS_LIST_KEY, 0, MAX_REPORTS - 1)

    return report
  } catch (error) {
    console.error("Error saving report:", error)
    throw error
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const reportData = await redis.get(`${REPORT_PREFIX}${id}`)

    if (!reportData) {
      return null
    }

    let parsed: unknown;
    if (typeof reportData === "string") {
      try {
        parsed = JSON.parse(reportData);
      } catch {
        // Fallback: JSON5 jika tersedia
        try {
          const json5 = await import("json5");
          parsed = json5.parse(reportData);
        } catch (e) {
          console.error("Report JSON parse error:", e, "\nRaw:", reportData)
          return null
        }
      }
    } else if (typeof reportData === "object" && reportData !== null) {
      parsed = reportData;
    } else {
      throw new Error("Invalid report data type");
    }

    // Perbaikan: Jangan gagal hanya karena properti opsional (methodology/findings/dll) kosong
    if (!isValidReport(parsed)) {
      // Cek jika semua properti wajib ada, properti opsional boleh kosong
      const r = parsed as Record<string, unknown>
      if (
        r &&
        typeof r.id === "string" &&
        typeof r.title === "string" &&
        typeof r.query === "string" &&
        typeof r.summary === "string" &&
        typeof r.introduction === "string" &&
        typeof r.analysis === "string" &&
        typeof r.conclusion === "string" &&
        Array.isArray(r.references) &&
        typeof r.createdAt === "string" &&
        typeof r.model === "string"
      ) {
        return r as Report
      }
      // Jika tidak valid, log error
      console.error("Report data does not conform to the Report type", parsed)
      return null
    }

    return parsed as Report;
  } catch (error) {
    console.error(`Error getting report ${id}:`, error)
    return null
  }
}

export async function getAllReports(): Promise<Report[]> {
  try {
    // Get all report IDs
    const reportIds = await redis.lrange(REPORTS_LIST_KEY, 0, -1)

    if (!reportIds || reportIds.length === 0) {
      return []
    }

    // Get all reports
    const reportPromises = reportIds.map((id) => getReportById(id))
    const reports = await Promise.all(reportPromises)

    // Filter out null reports
    return reports.filter(Boolean) as Report[]
  } catch (error) {
    console.error("Error getting all reports:", error)
    throw error
  }
}

export async function deleteReport(id: string): Promise<boolean> {
  try {
    // Delete the report
    await redis.del(`${REPORT_PREFIX}${id}`)

    // Remove the report ID from the list
    await redis.lrem(REPORTS_LIST_KEY, 0, id)

    return true
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error)
    throw error
  }
}
