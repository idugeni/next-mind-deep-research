import { formatDistanceToNow } from "date-fns"
import { id, enUS } from "date-fns/locale"
import { Clock, BadgeCheck } from "lucide-react"

interface ReportMetaProps {
  title: string
  createdAt: string
  model: string
  language?: string
  generatedAtLabel: string
  modelLabel: string
}

export default function ReportMeta({
  title,
  createdAt,
  model,
  language,
  generatedAtLabel,
  modelLabel,
}: ReportMetaProps) {
  const dateLocale = language === "id" ? id : enUS

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight mb-4">{title}</h1>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {generatedAtLabel}{" "}
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <BadgeCheck className="w-4 h-4" />
          <span>
            {modelLabel}: <span className="font-medium text-foreground">{model}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
