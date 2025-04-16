export type SearchLanguage = "id" | "en"

export interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
  type?: string // opsional, bisa pdf, video, dsb
  mime?: string // opsional, tipe file
  pagemap?: Record<string, unknown>; // opsional, struktur Google CSE (bisa diubah lebih detail jika ingin)
  // Untuk pemilihan cerdas (opsional, bisa diisi dari API atau hasil scoring)
  important?: boolean
  score?: number
}
