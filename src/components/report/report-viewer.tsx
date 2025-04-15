"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { id, enUS } from "date-fns/locale"

interface Report {
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
  createdAt: string
  model: string
  language?: string
}

interface ReportViewerProps {
  report: Report
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const language = report.language || "en"
  const dateLocale = language === "id" ? id : enUS

  const translatedLabels = {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>
            {translatedLabels.generatedAt}{" "}
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: dateLocale })}
          </span>
          <span>•</span>
          <span>
            {translatedLabels.model}: {report.model}
          </span>
        </div>
      </div>

      <Tabs defaultValue="full" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="full">{translatedLabels.full}</TabsTrigger>
          <TabsTrigger value="summary">{translatedLabels.summary}</TabsTrigger>
          <TabsTrigger value="introduction">{translatedLabels.introduction}</TabsTrigger>
          {report.methodology && <TabsTrigger value="methodology">{translatedLabels.methodology}</TabsTrigger>}
          {report.findings && <TabsTrigger value="findings">{translatedLabels.findings}</TabsTrigger>}
          <TabsTrigger value="analysis">{translatedLabels.analysis}</TabsTrigger>
          {report.discussion && <TabsTrigger value="discussion">{translatedLabels.discussion}</TabsTrigger>}
          <TabsTrigger value="conclusion">{translatedLabels.conclusion}</TabsTrigger>
          {report.recommendations && (
            <TabsTrigger value="recommendations">{translatedLabels.recommendations}</TabsTrigger>
          )}
          <TabsTrigger value="references">{translatedLabels.references}</TabsTrigger>
        </TabsList>

        <TabsContent value="full">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.executiveSummary}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{report.summary}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.introduction}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.introduction}</div>
              </CardContent>
            </Card>

            {report.methodology && (
              <Card>
                <CardHeader>
                  <CardTitle>{translatedLabels.methodology}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.methodology}</div>
                </CardContent>
              </Card>
            )}

            {report.findings && (
              <Card>
                <CardHeader>
                  <CardTitle>{translatedLabels.findings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.findings}</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.analysis}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.analysis}</div>
              </CardContent>
            </Card>

            {report.discussion && (
              <Card>
                <CardHeader>
                  <CardTitle>{translatedLabels.discussion}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.discussion}</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.conclusion}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.conclusion}</div>
              </CardContent>
            </Card>

            {report.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>{translatedLabels.recommendations}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.recommendations}</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.references}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {report.references.map((reference, index) => (
                    <li key={index} className="text-sm">
                      {reference}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>{translatedLabels.executiveSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{report.summary}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="introduction">
          <Card>
            <CardHeader>
              <CardTitle>{translatedLabels.introduction}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.introduction}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {report.methodology && (
          <TabsContent value="methodology">
            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.methodology}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.methodology}</div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {report.findings && (
          <TabsContent value="findings">
            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.findings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.findings}</div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>{translatedLabels.analysis}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.analysis}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {report.discussion && (
          <TabsContent value="discussion">
            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.discussion}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.discussion}</div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="conclusion">
          <Card>
            <CardHeader>
              <CardTitle>{translatedLabels.conclusion}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.conclusion}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {report.recommendations && (
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>{translatedLabels.recommendations}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-line">{report.recommendations}</div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle>{translatedLabels.references}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {report.references.map((reference, index) => (
                  <li key={index} className="text-sm">
                    {reference}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
