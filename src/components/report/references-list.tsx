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
          {references.map((reference, index) => {
            // Deteksi URL di dalam string referensi
            const urlMatch = reference.match(/(https?:\/\/[^\s]+)/)
            const url = urlMatch ? urlMatch[0] : null
            // Ambil judul sumber (teks sebelum 'URL:' atau sebelum url)
            let refTitle = reference
            if (url) {
              if (reference.includes('URL:')) {
                refTitle = reference.split('URL:')[0].trim()
              } else {
                refTitle = reference.replace(url, '').trim()
              }
            }
            // Hilangkan trailing tanda kurung atau ellipsis pada judul
            refTitle = refTitle.replace(/[.(\[]+$/, '').replace(/\s*\.\.\.$/, '').replace(/[)]+$/, '').trim()
            // Jika judul kosong, fallback ke url
            if (!refTitle) refTitle = url ? url.replace(/[)]+$/, '') : ''
            // Bersihkan url dari trailing ) jika ada
            const cleanUrl = url ? url.replace(/[)]+$/, '') : null
            return (
              <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                {refTitle}
                {cleanUrl && (
                  <>
                    {' '}
                    (<a href={cleanUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{cleanUrl}</a>)
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
