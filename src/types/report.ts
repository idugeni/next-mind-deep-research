export type Report = {
  id: string;
  title: string;
  query: string;
  summary: string;
  introduction: string;
  literature_review?: string;
  methodology?: string;
  findings?: string;
  analysis: string;
  critical_appraisal?: string;
  discussion?: string;
  conclusion: string;
  recommendations?: string;
  references: string[];
  language?: string;
  createdAt: string;
  model: string;
  description?: string;
  content?: string;
};

export interface ReportDownloadParams {
  content: string
  filename: string
  contentType: string
}

export interface BlobDownloadParams {
  blob: Blob
  filename: string
}