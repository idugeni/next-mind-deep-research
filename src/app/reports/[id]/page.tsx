"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Download, FileText, FileImage } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ReportViewer from "@/components/report-viewer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generateDocx } from "@/lib/docx-generator"
import { generatePdf } from "@/lib/pdf-generator"

export default function ReportPage() {
  const params = useParams()
  const reportId = params.id
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingFile, setIsGeneratingFile] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch report")
        }

        const data = await response.json()
        setReport(data.report)
      } catch (error) {
        console.error("Error fetching report:", error)
        toast({
          title: "Error",
          description: "Failed to load report. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (reportId) {
      fetchReport()
    }
  }, [reportId, toast])

  const handleDownloadMarkdown = () => {
    if (!report) return

    const reportText = generateMarkdownReport(report)
    downloadFile(reportText, `${getReportFilename(report)}.md`, "text/markdown")
  }

  const handleDownloadWord = async () => {
    if (!report) return
    setIsGeneratingFile(true)

    try {
      const docxBlob = await generateDocx(report)
      downloadBlob(docxBlob, `${getReportFilename(report)}.docx`)
    } catch (error) {
      console.error("Error generating Word document:", error)
      toast({
        title: "Error",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive",
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
      downloadBlob(pdfBlob, `${getReportFilename(report)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingFile(false)
    }
  }

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType })
    downloadBlob(blob, filename)
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getReportFilename = (report) => {
    return report.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The report you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>Start New Research</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const language = report.language || "en"
  const backToReportsText = language === "id" ? "Kembali ke Laporan" : "Back to Reports"
  const downloadText = language === "id" ? "Unduh" : "Download"

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <Link href="/reports">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backToReportsText}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={isGeneratingFile}>
              {isGeneratingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "id" ? "Memproses..." : "Processing..."}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {downloadText}
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownloadMarkdown}>
              <FileText className="mr-2 h-4 w-4" />
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadWord}>
              <FileText className="mr-2 h-4 w-4" />
              Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPdf}>
              <FileImage className="mr-2 h-4 w-4" />
              PDF (.pdf)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReportViewer report={report} />
    </div>
  )
}

function generateMarkdownReport(report) {
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

  let markdown = `# ${report.title}\n\n`

  markdown += `## ${labels.executiveSummary}\n\n${report.summary}\n\n`
  markdown += `## ${labels.introduction}\n\n${report.introduction}\n\n`

  if (report.methodology) {
    markdown += `## ${labels.methodology}\n\n${report.methodology}\n\n`
  }

  if (report.findings) {
    markdown += `## ${labels.findings}\n\n${report.findings}\n\n`
  }

  markdown += `## ${labels.analysis}\n\n${report.analysis}\n\n`

  if (report.discussion) {
    markdown += `## ${labels.discussion}\n\n${report.discussion}\n\n`
  }

  markdown += `## ${labels.conclusion}\n\n${report.conclusion}\n\n`

  if (report.recommendations) {
    markdown += `## ${labels.recommendations}\n\n${report.recommendations}\n\n`
  }

  markdown += `## ${labels.references}\n\n`
  report.references.forEach((reference, index) => {
    markdown += `${index + 1}. ${reference}\n`
  })

  return markdown
}
