"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { id, enUS } from "date-fns/locale"
import ReportMeta from "./report-meta"
import ReportSectionCard from "./report-section-card"
import ReferencesList from "./references-list"
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Report } from "@/types/report"

interface ReportViewerProps {
  report: Report
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const language = report.language || "en"
  const dateLocale = language === "id" ? id : enUS
  const [activeTab, setActiveTab] = useState("full")

  const t = {
    full: language === "id" ? "Laporan Lengkap" : "Full Report",
    summary: language === "id" ? "Ringkasan" : "Summary",
    introduction: language === "id" ? "Pendahuluan" : "Introduction",
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

  const tabList = [
    { value: "full", label: t.full },
    { value: "summary", label: t.summary },
    { value: "introduction", label: t.introduction },
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="w-full flex gap-0 justify-between overflow-x-auto scroll-smooth scroll-px-4 snap-x scrollbar-hide bg-muted border border-border rounded-full shadow-md p-1 h-[48px] min-h-[48px] transition-colors duration-300"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabList.map((tab) => {
            const Icon = tabIcons[tab.value as keyof typeof tabIcons] || FileText;
            const isActive = tab.value === activeTab

            return (
              <Tooltip key={tab.value}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab.value}
                    className={cn(
                      "flex-1 min-w-0 h-full flex items-center justify-center rounded-full px-0 py-0 text-base font-medium whitespace-nowrap transition-all duration-300 ease-in-out border shadow-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow"
                        : "bg-muted text-muted-foreground border-transparent"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "stroke-primary-foreground" : "stroke-muted-foreground")} />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">{tab.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="full" className="mt-6 space-y-6 animate-fade-in">
          <ReportSectionCard title={t.executiveSummary}>
            <p>{report.summary}</p>
          </ReportSectionCard>
          <ReportSectionCard title={t.introduction}>{report.introduction}</ReportSectionCard>
          {report.methodology && <ReportSectionCard title={t.methodology}>{report.methodology}</ReportSectionCard>}
          {report.findings && <ReportSectionCard title={t.findings}>{report.findings}</ReportSectionCard>}
          <ReportSectionCard title={t.analysis}>{report.analysis}</ReportSectionCard>
          {report.discussion && <ReportSectionCard title={t.discussion}>{report.discussion}</ReportSectionCard>}
          <ReportSectionCard title={t.conclusion}>{report.conclusion}</ReportSectionCard>
          {report.recommendations && <ReportSectionCard title={t.recommendations}>{report.recommendations}</ReportSectionCard>}
          <ReferencesList references={report.references} title={t.references} />
        </TabsContent>

        {tabList.map(tab => {
          if (tab.value === "full") return null
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-6 animate-fade-in">
              {tab.value === "summary" && (
                <ReportSectionCard title={t.executiveSummary}>
                  <p>{report.summary}</p>
                </ReportSectionCard>
              )}
              {tab.value === "introduction" && (
                <ReportSectionCard title={t.introduction}>{report.introduction}</ReportSectionCard>
              )}
              {tab.value === "methodology" && report.methodology && (
                <ReportSectionCard title={t.methodology}>{report.methodology}</ReportSectionCard>
              )}
              {tab.value === "findings" && report.findings && (
                <ReportSectionCard title={t.findings}>{report.findings}</ReportSectionCard>
              )}
              {tab.value === "analysis" && (
                <ReportSectionCard title={t.analysis}>{report.analysis}</ReportSectionCard>
              )}
              {tab.value === "discussion" && report.discussion && (
                <ReportSectionCard title={t.discussion}>{report.discussion}</ReportSectionCard>
              )}
              {tab.value === "conclusion" && (
                <ReportSectionCard title={t.conclusion}>{report.conclusion}</ReportSectionCard>
              )}
              {tab.value === "recommendations" && report.recommendations && (
                <ReportSectionCard title={t.recommendations}>{report.recommendations}</ReportSectionCard>
              )}
              {tab.value === "references" && (
                <ReferencesList references={report.references} title={t.references} />
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
