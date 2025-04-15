import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import React from "react"

interface ReportSectionCardProps {
  title: string
  children: React.ReactNode
}

export default function ReportSectionCard({ title, children }: ReportSectionCardProps) {
  return (
    <Card className="rounded-2xl shadow-md border border-muted bg-background animate-in fade-in slide-in-from-bottom duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose dark:prose-invert max-w-none whitespace-pre-line leading-relaxed">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
