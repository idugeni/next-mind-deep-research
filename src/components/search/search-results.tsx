"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink } from "lucide-react"

interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
}

interface SearchResultsProps {
  results: SearchResult[]
  onResultSelect: (result: SearchResult, isSelected: boolean) => void
  selectedResults: SearchResult[]
}

export default function SearchResults({ results, onResultSelect, selectedResults }: SearchResultsProps) {
  const isSelected = (result: SearchResult) => {
    return selectedResults.some((item) => item.link === result.link)
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-start p-4 gap-4">
              <div className="pt-1">
                <Checkbox
                  id={`result-${index}`}
                  checked={isSelected(result)}
                  onCheckedChange={(checked) => onResultSelect(result, !!checked)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <h3 className="font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: result.title }} />
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground flex items-center hover:underline truncate mb-2"
                  >
                    {result.displayLink}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <p
                    className="text-sm text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
