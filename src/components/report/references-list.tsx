import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ReferencesListProps {
  references: string[]
  title: string
}

export default function ReferencesList({ references, title }: ReferencesListProps) {
  return (
    <Card className="rounded-2xl shadow-md border border-muted bg-background animate-in fade-in slide-in-from-bottom duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="list-disc pl-5 space-y-2">
          {references.map((reference, index) => (
            <li key={index} className="text-sm text-muted-foreground leading-relaxed">
              {reference}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
