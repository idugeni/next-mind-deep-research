import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import React from "react"

interface ReportSectionCardProps {
  title: string
  children: React.ReactNode
}

export default function ReportSectionCard({ title, children }: ReportSectionCardProps) {
  return (
    <Card className="rounded-2xl shadow-md border border-muted bg-background animate-in fade-in slide-in-from-bottom duration-300 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="overflow-x-auto">
          <div className="prose dark:prose-invert max-w-none leading-relaxed prose-table:w-full prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-td:border prose-td:border-border prose-table:bg-background prose-tbody:odd:bg-muted/40 prose-headings:text-left prose-p:text-justify prose-ul:text-left prose-ol:text-left prose-blockquote:text-left !text-left prose-h1:mt-0 prose-h2:mt-4 prose-h3:mt-3 prose-p:mt-2 prose-ul:my-4 prose-ol:my-4">
            {/* Render children as HTML, ganti **text** jadi <b>text</b> jika masih ada */}
            {typeof children === 'string' ? (
              <span dangerouslySetInnerHTML={{ __html: children.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
            ) : (
              children
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
