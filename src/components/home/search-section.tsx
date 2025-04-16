"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SearchInput from "@/components/search/search-input"
import LanguageSelector from "@/components/search/language-selector"
import type { SearchLanguage, SearchResult } from "@/types/search"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"

interface SearchSectionProps {
  onSearchComplete: (results: SearchResult[], query: string) => void
}

export default function SearchSection({ onSearchComplete }: SearchSectionProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const [hasResult, setHasResult] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&language=${selectedLanguage}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to search")
      }

      const data = await response.json()
      onSearchComplete(data.items || [], query)
      setHasResult(!!(data.items && data.items.length > 0))
    } catch (error) {
      toast.error("Error", {
        description: getErrorMessage(error, "Failed to perform search. Please try again.")
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    onSearchComplete([], "")
    setHasResult(false)
  }

  return (
    <Card className="mb-4">
      <CardContent>
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <SearchInput onSearch={handleSearch} isLoading={isSearching} showReset={hasResult} onReset={handleReset} />
      </CardContent>
    </Card>
  )
}