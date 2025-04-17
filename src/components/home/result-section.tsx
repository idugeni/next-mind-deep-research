"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import ModelSelector from "@/components/model-selector"
import SearchResults from "@/components/search/search-results"
import { SearchResult } from "@/types/search"

interface ResultSectionProps {
  searchResults: SearchResult[]
  selectedResults: SearchResult[]
  onGenerateReportAction: () => void
  isGenerating: boolean
  selectedModel: string
  onModelChangeAction: (model: string) => void
  onResultSelectAction: (result: SearchResult, isSelected: boolean) => void
}

export default function ResultSection({
  searchResults,
  selectedResults,
  onGenerateReportAction,
  isGenerating,
  selectedModel,
  onModelChangeAction,
  onResultSelectAction,
}: ResultSectionProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChangeAction} />
          <Button
            onClick={onGenerateReportAction}
            disabled={selectedResults.length === 0 || isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </div>
      </div>

      <SearchResults
        results={searchResults}
        onResultSelectAction={onResultSelectAction}
        selectedResults={selectedResults}
      />
    </>
  )
}