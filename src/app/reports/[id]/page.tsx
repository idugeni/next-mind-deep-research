"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Download, FileText, FileImage } from "lucide-react"
import ReportViewer from "@/components/report/report-viewer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generateDocx } from "@/lib/docx-generator"
import { generatePdf } from "@/lib/pdf-generator"
import { Report, ReportDownloadParams, BlobDownloadParams } from "@/types/report"
import { toast } from "sonner"
import { fetchWithTimeout, getErrorMessage } from "@/lib/utils"
import Link from "next/link"
import { useDocumentMeta } from '@/hooks/use-document-meta'
import { formatTitle, DEFAULT_DESCRIPTION } from '@/lib/metadata'

export default function ReportPage() {
  const params = useParams()
  const reportId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const [report, setReport] = useState<Report | null>(null)
  const [isGeneratingFile, setIsGeneratingFile] = useState(false)
  const [fetched, setFetched] = useState(false)

  // Title dinamis: gunakan judul report jika ada, fallback ke 'Laporan - NextMind'
  const [metaTitle, setMetaTitle] = useState<string>(formatTitle('Laporan'))
  const [metaDesc, setMetaDesc] = useState<string>(DEFAULT_DESCRIPTION)

  useDocumentMeta(metaTitle, metaDesc)

  useEffect(() => {
    const fetchReportData = async () => {
      if (!reportId) {
        toast.error("Error", { description: "Invalid or missing report ID." })
        setFetched(true)
        setMetaTitle(formatTitle('Laporan Tidak Ditemukan'))
        return
      }
      try {
        // Gunakan fetchWithTimeout agar tidak hang jika API lambat
        const response = await fetchWithTimeout(`/api/reports/${reportId}`, {}, 15000)
        if (!response.ok) {
          throw new Error("Failed to fetch report")
        }
        const data = await response.json()
        // Karena API sekarang mengembalikan objek report langsung, bukan { report: ... }
        setReport(data)
        setFetched(true)
        // Jika report valid, update title dan description secara lebih informatif
        if (data && data.title) {
          setMetaTitle(formatTitle(`${data.title} - Laporan Riset - NextMind`))
        } else {
          setMetaTitle(formatTitle('Laporan Tidak Ditemukan - NextMind'))
        }
        if (data && data.summary) setMetaDesc(data.summary)
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            toast.error("Timeout", { description: "Permintaan terlalu lama, silakan coba lagi." })
          } else {
            toast.error("Error", { description: getErrorMessage(error, "Gagal mengambil data report.") })
          }
        } else {
          toast.error("Error", { description: "Gagal mengambil data report (unknown error)." })
        }
        setFetched(true)
        setMetaTitle(formatTitle('Laporan Tidak Ditemukan - NextMind'))
      }
    }
    fetchReportData()
  }, [reportId])

  // Helper: validasi report minimal agar tidak render data rusak/kosong
  function isValidReport(report: unknown): report is Report {
    if (!report || typeof report !== 'object') return false;
    const r = report as Record<string, unknown>;
    return (
      typeof r.title === 'string' &&
      typeof r.summary === 'string' &&
      typeof r.introduction === 'string' &&
      typeof r.analysis === 'string' &&
      typeof r.conclusion === 'string' &&
      Array.isArray(r.references)
    );
  }

  const handleDownloadMarkdown = () => {
    if (!report) return

    const reportText = generateMarkdownReport(report)
    downloadFile({ content: reportText, filename: `${getReportFilename(report)}.md`, contentType: "text/markdown" })
  }

  const handleDownloadWord = async () => {
    if (!report) return
    setIsGeneratingFile(true)

    try {
      const docxBlob = await generateDocx(report)
      downloadBlob({ blob: docxBlob, filename: `${getReportFilename(report)}.docx` })
    } catch {
      toast.error("Error", {
        description: "Failed to generate Word document. Please try again."
      })
    } finally {
      setIsGeneratingFile(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!report) return
    setIsGeneratingFile(true)

    try {
      const pdfBlob = await generatePdf(report)
      downloadBlob({ blob: pdfBlob, filename: `${getReportFilename(report)}.pdf` })
    } catch {
      toast.error("Error", {
        description: "Failed to generate PDF. Please try again."
      })
    } finally {
      setIsGeneratingFile(false)
    }
  }

  const downloadFile = ({ content, filename, contentType }: ReportDownloadParams): void => {
    const blob = new Blob([content], { type: contentType })
    downloadBlob({ blob, filename })
  }

  const downloadBlob = ({ blob, filename }: BlobDownloadParams): void => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getReportFilename = (report: Report): string => {
    return (report.title ?? "untitled").replace(/[^a-z0-9]/gi, "_").toLowerCase()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-row justify-between items-center mb-8 gap-4 w-full bg-card border border-border p-4 rounded-xl shadow-md">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
        >
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Laporan
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              disabled={isGeneratingFile}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isGeneratingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover text-popover-foreground border border-border shadow-xl rounded-lg"
          >
            <DropdownMenuItem
              onClick={handleDownloadMarkdown}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" />
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownloadWord}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" />
              Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownloadPdf}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <FileImage className="mr-2 h-4 w-4" />
              PDF (.pdf)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* SKELETON LOADER diganti dengan SPINNER agar konsisten dengan loading.tsx */}
      {!fetched && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      )}
      {report && isValidReport(report) ? (
        <ReportViewer report={report} />
      ) : fetched ? (
        <div className="text-center text-destructive font-semibold py-20">
          {(typeof window !== 'undefined' && (navigator.language === 'id' || navigator.language.startsWith('id')))
            ? "Laporan tidak ditemukan atau rusak."
            : "Report not found or corrupted."}
        </div>
      ) : null}
    </div>
  )
}

function generateMarkdownReport(report: Report): string {
  const language = report.language || "en"

  const labels = {
    executiveSummary: language === "id" ? "Ringkasan Eksekutif" : "Executive Summary",
    introduction: language === "id" ? "Pendahuluan" : "Introduction",
    methodology: language === "id" ? "Metodologi" : "Methodology",
    findings: language === "id" ? "Temuan" : "Findings",
    analysis: language === "id" ? "Analisis" : "Analysis",
    discussion: language === "id" ? "Diskusi" : "Discussion",
    conclusion: language === "id" ? "Kesimpulan" : "Conclusion",
    recommendations: language === "id" ? "Rekomendasi" : "Recommendations",
    references: language === "id" ? "Referensi" : "References",
  }

  // Helper: Trim and ensure only single empty line between sections
  function section(title: string, content?: string | null | undefined) {
    if (!content || !content.trim()) return '';
    return `## ${title}\n\n${content.trim()}\n`;
  }

  let markdown = `# ${report.title.trim()}\n\n`;

  markdown += section(labels.executiveSummary, report.summary) + '\n';
  markdown += section(labels.introduction, report.introduction) + '\n';
  markdown += report.methodology ? section(labels.methodology, report.methodology) + '\n' : '';
  markdown += report.findings ? section(labels.findings, report.findings) + '\n' : '';
  markdown += section(labels.analysis, report.analysis) + '\n';
  markdown += report.discussion ? section(labels.discussion, report.discussion) + '\n' : '';
  markdown += section(labels.conclusion, report.conclusion) + '\n';
  markdown += report.recommendations ? section(labels.recommendations, report.recommendations) + '\n' : '';

  markdown += `## ${labels.references}\n\n`;
  report.references.forEach((reference: string) => {
    if (reference && reference.trim()) {
      markdown += `${reference.trim()}\n`;
    }
  });

  // Hapus baris baru berlebih di akhir
  return markdown.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
