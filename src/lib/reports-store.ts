import redis from "./redis"

interface Report {
  id: string
  title: string
  query: string
  summary: string
  introduction: string
  analysis: string
  conclusion: string
  references: string[]
  createdAt: string
  model: string
}

// Key for storing the list of report IDs
const REPORTS_LIST_KEY = "nextmind:reports:list"

// Prefix for storing individual reports
const REPORT_PREFIX = "nextmind:report:"

// Maximum number of reports to keep
const MAX_REPORTS = 50

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

    // Handle the case where reportData might be an object or a string
    if (typeof reportData === "object") {
      return reportData as Report
    }

    try {
      // Safely parse the JSON string
      return JSON.parse(reportData)
    } catch (parseError) {
      console.error(`Error parsing report data for ${id}:`, parseError)
      throw new Error(`Invalid report data format: ${parseError.message}`)
    }
  } catch (error) {
    console.error(`Error getting report ${id}:`, error)
    throw error
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
