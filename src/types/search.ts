export type SearchLanguage = "id" | "en"

export interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
  type?: string // opsional, bisa pdf, video, dsb
}
