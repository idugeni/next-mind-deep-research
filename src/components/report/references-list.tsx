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
            // Parsing: Sumber n: Judul (url)
            const refPattern = /^Sumber (\d+):\s*(.*?)\s*\((https?:\/\/[^)]+)\)$/;
            const match = reference.match(refPattern);
            let refTitle = reference;
            let refUrl = null;
            let sumberNo: string = (index + 1).toString();
            if (match) {
              sumberNo = match[1];
              refTitle = match[2].trim();
              refUrl = match[3].trim();
            } else {
              // Fallback: deteksi url di string (tanpa format)
              const urlMatch = reference.match(/(https?:\/\/[^\s)]+)/);
              if (urlMatch) {
                refTitle = reference.replace(urlMatch[0], '').replace(/[()]/g, '').replace(/^Sumber \d+:/, '').trim();
                refUrl = urlMatch[0];
                if (!refTitle) refTitle = refUrl;
              }
            }
            return (
              <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold mr-1">Sumber {sumberNo}:</span>
                {refUrl ? (
                  <a href={refUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{refTitle}</a>
                ) : (
                  refTitle
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
