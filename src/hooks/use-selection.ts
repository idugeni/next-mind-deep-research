import { useState } from "react"
import { SearchResult } from "@/types/search"

export function useSelection(initialSelected: SearchResult[] = []) {
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>(initialSelected)

  const handleResultSelect = (result: SearchResult, isSelected: boolean) => {
    setSelectedResults(prev => {
      if (isSelected) {
        return [...prev, result]
      } else {
        return prev.filter((item) => item.link !== result.link)
      }
    })
  }

  const handleBatchSelect = (results: SearchResult[], isSelected: boolean) => {
    setSelectedResults(prev => {
      if (isSelected) {
        const newResults = results.filter(r => !prev.some(s => s.link === r.link))
        return [...prev, ...newResults]
      } else {
        return prev.filter(s => !results.some(r => r.link === s.link))
      }
    })
  }

  return { selectedResults, setSelectedResults, handleResultSelect, handleBatchSelect }
}
