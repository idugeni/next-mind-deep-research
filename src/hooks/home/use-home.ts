"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SearchLanguage } from "@/components/search/language-selector"

interface SearchResult {
  title: string
  link: string
  displayLink: string
  snippet: string
}

export function useHome() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro-exp-03-25")
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const router = useRouter()

  const handleSearchComplete = (results: SearchResult[], query: string) => {
    setSearchResults(results)
    setSelectedResults([])
    setSearchQuery(query)
  }

  const handleResultSelect = (result: SearchResult, isSelected: boolean) => {
    if (isSelected) {
      setSelectedResults([...selectedResults, result])
    } else {
      setSelectedResults(selectedResults.filter((item) => item.link !== result.link))
    }
  }

  const handleGenerateReport = async () => {
    if (!searchQuery || selectedResults.length === 0) {
      toast.error("Please select at least one search result")
      return
    }

    setIsGenerating(true)

    try {
      console.log('Generating report with:', { searchQuery, selectedResults, selectedModel })

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          results: selectedResults,
          model: selectedModel,
          language: selectedLanguage
        }),
      })

      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.message || "Failed to generate report")
      }

      const data = await response.json()
      console.log('Report generated successfully:', data)
      router.push(`/reports/${data.reportId}`)
    } catch (error) {
      console.error('Error generating report:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate report. Please try again."
      toast.error("Error", {
        description: errorMessage
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    searchResults,
    selectedResults,
    isGenerating,
    selectedModel,
    selectedLanguage,
    setSelectedLanguage,
    handleSearchComplete,
    handleResultSelect,
    handleGenerateReport,
    setSelectedModel,
  }
}