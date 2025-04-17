// src/lib/metadata.ts
// Centralized metadata config & helpers

export const APP_NAME = "NextMind"
export const APP_TAGLINE = "Deep Research"
export const MAIN_TITLE = `${APP_NAME} - ${APP_TAGLINE}`
export const TITLE_SUFFIX = ` - ${APP_NAME}`
export const DEFAULT_DESCRIPTION = "Platform riset dan laporan NextMind."

export interface Metadata {
  title: string
  description?: string
  keywords?: string[]
  author?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  [key: string]: unknown
}

/**
 * Compose a page title with suffix, except for main page
 */
export function formatTitle(title?: string, isMain = false): string {
  if (!title || isMain) return MAIN_TITLE
  if (title.endsWith(TITLE_SUFFIX.trim())) return title
  return `${title}${TITLE_SUFFIX}`
}

/**
 * Compose metadata object with defaults
 */
export function createMetadata(
  meta: Partial<Metadata> & { title?: string }
): Metadata {
  return {
    title: formatTitle(meta.title, meta.title === MAIN_TITLE),
    description: meta.description || DEFAULT_DESCRIPTION,
    keywords: meta.keywords || [],
    author: meta.author || '',
    createdAt: meta.createdAt || new Date().toISOString(),
    updatedAt: meta.updatedAt || new Date().toISOString(),
    ...meta,
  }
}
