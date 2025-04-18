import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ReferencesListProps {
  references: string[]
  title: string
}

export default function ReferencesList({ references, title }: ReferencesListProps) {
  return (
    <Card className="rounded-none border-0 bg-transparent shadow-none mb-6 p-0">
      <CardHeader className="pb-0 px-0 mb-0">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground mb-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-0 md:px-0 pb-2 mt-0">
        <ul className="list-disc pl-5 space-y-2">
          {references.map((reference, index) => {
            // Deteksi URL dalam format (URL: ...)
            const urlPattern = /\(URL: (https?:\/\/[^)]+)\)/;
            const urlMatch = reference.match(urlPattern);
            const url = urlMatch ? urlMatch[1] : null;
            let refTitle = reference.trim();
            // Jika ada (URL: ...), tampilkan bagian sebelum (URL: ...)
            if (urlMatch) {
              refTitle = reference.split(urlPattern)[0].replace(/[:\s]+$/, '').trim();
            }
            // Jika tidak ada (URL: ...), deteksi url biasa untuk hyperlink
            const fallbackUrlMatch = !url && reference.match(/(https?:\/\/[^\s]+)/);
            const cleanUrl = url || (fallbackUrlMatch ? fallbackUrlMatch[0].replace(/[)]+$/, '') : null);
            // Hilangkan trailing ... pada judul referensi
            let cleanRefTitle = refTitle.replace(/\.\.\.$/, '').trim();
            // Jika judul jadi kosong setelah dihilangkan, fallback ke url
            if (!cleanRefTitle) cleanRefTitle = cleanUrl || '';
            return (
              <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                {cleanRefTitle}
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
