import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"
import { id, enUS } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility: Format date to relative string
export function formatRelativeDate(date: string | Date, lang: "id" | "en" = "en") {
  const locale = lang === "id" ? id : enUS
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale })
}

// Utility: fetch with timeout (AbortController)
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// Re-export categorizeResults and detectResultType for centralization
export { categorizeResults, detectResultType } from "./search-utils"
