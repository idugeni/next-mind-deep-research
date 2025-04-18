import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import React from "react"

interface ReportSectionCardProps {
  title: string
  children: React.ReactNode
}

export default function ReportSectionCard({ title, children }: ReportSectionCardProps) {
  return (
    <Card className="rounded-none border-0 bg-transparent shadow-none mb-6 p-0 gap-0">
      <CardHeader className="pb-0 px-0 mb-0">
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-0">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-0 md:px-0 pb-2 mt-0">
        <div className="overflow-x-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none leading-relaxed prose-table:w-full prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-td:border prose-td:border-border prose-table:bg-background prose-tbody:odd:bg-muted/40 prose-headings:text-left prose-p:text-justify prose-ul:text-left prose-ol:text-left prose-blockquote:text-left !text-left prose-h1:mt-0 prose-h2:mt-2 prose-h3:mt-2 prose-p:mt-1 prose-ul:my-3 prose-ol:my-3 prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-primary/60 prose-blockquote:bg-muted/30 prose-blockquote:px-4 prose-blockquote:py-2 prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-primary prose-code:text-base prose-li:mb-1 prose-li:marker:text-primary prose-li:text-base prose-strong:font-bold prose-strong:text-primary"
            style={{ wordBreak: 'break-word', fontVariantLigatures: 'common-ligatures discretionary-ligatures' }}
          >
            {/* Render children as HTML, ganti **text** jadi <b>text</b> jika masih ada */}
            {typeof children === 'string' ? (
              <span
                className="text-warning"
                dangerouslySetInnerHTML={{
                  __html: children.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(
                    /\[object Object\]/g,
                    '<span class="text-warning">Bagian ini tidak memiliki hasil atau data yang dapat ditampilkan berdasarkan riset yang dilakukan.</span>'
                  )
                }}
              />
            ) : (
              typeof children === 'object' && String(children) === '[object Object]' ? (
                <span className="text-warning">Bagian ini tidak memiliki hasil atau data yang dapat ditampilkan berdasarkan riset yang dilakukan.</span>
              ) : (
                children
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
