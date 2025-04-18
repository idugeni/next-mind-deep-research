"use client"

import ReportMeta from "./report-meta"
import {
  FileText,
  ListOrdered,
  BookOpen,
  FlaskConical,
  Search,
  BarChart2,
  MessageCircle,
  CheckCircle2,
  Lightbulb,
  Library,
} from "lucide-react"
import { Report } from "@/types/report"
import ReportTabs from "./report-tabs"

interface ReportViewerProps {
  report: Report
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const language = report.language || "en"

  const t = {
    full: language === "id" ? "Laporan Lengkap" : "Full Report",
    summary: language === "id" ? "Ringkasan" : "Summary",
    introduction: language === "id" ? "Pendahuluan" : "Introduction",
    literatureReview: language === "id" ? "Tinjauan Pustaka" : "Literature Review",
    criticalAppraisal: language === "id" ? "Appraisal Kritis" : "Critical Appraisal",
    methodology: language === "id" ? "Metodologi" : "Methodology",
    findings: language === "id" ? "Temuan" : "Findings",
    analysis: language === "id" ? "Analisis" : "Analysis",
    discussion: language === "id" ? "Diskusi" : "Discussion",
    conclusion: language === "id" ? "Kesimpulan" : "Conclusion",
    recommendations: language === "id" ? "Rekomendasi" : "Recommendations",
    references: language === "id" ? "Referensi" : "References",
    executiveSummary: language === "id" ? "Ringkasan Eksekutif" : "Executive Summary",
    generatedAt: language === "id" ? "Dibuat" : "Generated",
    model: language === "id" ? "Model" : "Model",
  }

  const tabIcons = {
    full: FileText,
    summary: ListOrdered,
    introduction: BookOpen,
    methodology: FlaskConical,
    findings: Search,
    analysis: BarChart2,
    discussion: MessageCircle,
    conclusion: CheckCircle2,
    recommendations: Lightbulb,
    references: Library,
  }

  // Skala prioritas urutan tab/kartu
  const tabList = [
    { value: "full", label: t.full },
    { value: "summary", label: t.summary },
    { value: "introduction", label: t.introduction },
    ...(report.literature_review ? [{ value: "literature_review", label: t.literatureReview }] : []),
    ...(report.critical_appraisal ? [{ value: "critical_appraisal", label: t.criticalAppraisal }] : []),
    ...(report.methodology ? [{ value: "methodology", label: t.methodology }] : []),
    ...(report.findings ? [{ value: "findings", label: t.findings }] : []),
    { value: "analysis", label: t.analysis },
    ...(report.discussion ? [{ value: "discussion", label: t.discussion }] : []),
    { value: "conclusion", label: t.conclusion },
    ...(report.recommendations ? [{ value: "recommendations", label: t.recommendations }] : []),
    { value: "references", label: t.references },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-10 bg-background rounded-md shadow-md animate-in fade-in duration-500">
      <ReportMeta
        title={report.title}
        createdAt={report.createdAt}
        model={report.model}
        language={report.language}
        generatedAtLabel={t.generatedAt}
        modelLabel={t.model}
      />

      <ReportTabs
        tabList={tabList}
        tabIcons={tabIcons}
        report={report}
        t={t}
      />
    </div>
  )
}
