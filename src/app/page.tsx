"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SearchInput from "@/components/search-input"
import SearchResults from "@/components/search-results"
import ModelSelector from "@/components/model-selector"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro-exp-03-25")
  const router = useRouter()

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setIsSearching(true)
    setSearchQuery(query)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to search")
      }

      const data = await response.json()
      setSearchResults(data.items || [])
      setSelectedResults([])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to perform search. Please try again.";
      toast.error("Error", {
        description: errorMessage
      });
    } finally {
      setIsSearching(false);
    }
  }

  const handleResultSelect = (result: SearchResult, isSelected: boolean) => {
    if (isSelected) {
      setSelectedResults([...selectedResults, result])
    } else {
      setSelectedResults(selectedResults.filter((item) => item.link !== result.link))
    }
  }

  const handleGenerateReport = async () => {
    if (selectedResults.length === 0) {
      toast.error("Please select at least one search result")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          selectedResults,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate report")
      }

      const data = await response.json()
      router.push(`/reports/${data.reportId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate report. Please try again.";
      toast.error("Error", {
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">NextMind Research Tool</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <SearchInput onSearch={handleSearch} isLoading={isSearching} />
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <Button
                onClick={handleGenerateReport}
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
            onResultSelect={handleResultSelect}
            selectedResults={selectedResults}
          />
        </>
      )}
    </div>
  )
}
