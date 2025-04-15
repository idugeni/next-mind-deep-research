"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import ModelSelector from "@/components/model-selector"

interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
}

interface ResultSectionProps {
  searchResults: SearchResult[]
  selectedResults: SearchResult[]
  onGenerateReport: () => void
  isGenerating: boolean
  selectedModel: string
  onModelChange: (model: string) => void
}

export default function ResultSection({
  searchResults,
  selectedResults,
  onGenerateReport,
  isGenerating,
  selectedModel,
  onModelChange,
}: ResultSectionProps) {
  if (searchResults.length === 0) return null

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
          <Button
            onClick={onGenerateReport}
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

      {/* Hapus komponen SearchResults di sini untuk menghindari duplikasi UI filter/list hasil */}
      {/* <SearchResults
        results={searchResults}
        onResultSelect={onResultSelect}
        selectedResults={selectedResults}
      /> */}
    </>
  )
}