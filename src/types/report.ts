export interface Report {
  id: string
  title: string
  query: string
  summary: string
  introduction: string
  methodology?: string
  findings?: string
  analysis: string
  discussion?: string
  conclusion: string
  recommendations?: string
  references: string[]
  language?: string
  createdAt: string
  model: string
}

export interface ReportDownloadParams {
  content: string
  filename: string
  contentType: string
}

export interface BlobDownloadParams {
  blob: Blob
  filename: string
}