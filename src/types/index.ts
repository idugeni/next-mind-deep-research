export interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
}

export interface Report {
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

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}
