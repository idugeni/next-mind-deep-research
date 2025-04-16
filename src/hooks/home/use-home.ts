"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { SearchResult, SearchLanguage } from "@/types/search"
import { categorizeResults } from "@/lib/search-utils"
import { useSelection } from "@/hooks/use-selection"
import { DEFAULT_MODEL_ID } from "@/constants/models"
import { getErrorMessage } from "@/lib/utils"

type UseHomeReturn = {
  searchResults: SearchResult[]
  selectedResults: SearchResult[]
  isGenerating: boolean
  selectedModel: string
  selectedLanguage: SearchLanguage
  setSelectedLanguage: (language: SearchLanguage) => void
  handleSearchComplete: (results: SearchResult[], query: string) => void
  handleResultSelect: (result: SearchResult, isSelected: boolean) => void
  handleGenerateReport: () => void
  setSelectedModel: (model: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setSelectedResults: (results: SearchResult[]) => void
  handleBatchSelect: (results: SearchResult[], isSelected: boolean) => void
}

export function useHome(): UseHomeReturn {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID)
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const router = useRouter()

  // Gunakan custom hook untuk seleksi hasil
  const {
    selectedResults,
    setSelectedResults,
    handleResultSelect,
    handleBatchSelect
  } = useSelection([])

  // Memoized categorized results (contoh jika ada komputasi berat)
  const categorizedResults = useMemo(() => categorizeResults(searchResults), [searchResults])

  // Memoized handler
  const handleSearchComplete = useCallback((results: SearchResult[], query: string) => {
    setSearchResults(results)
    setSelectedResults([])
    setSearchQuery(query)
  }, [setSearchResults, setSelectedResults, setSearchQuery])

  const handleResultSelectMemo = useCallback(handleResultSelect, [handleResultSelect])
  const handleBatchSelectMemo = useCallback(handleBatchSelect, [handleBatchSelect])

  const handleGenerateReport = useCallback(async () => {
    if (!searchQuery || selectedResults.length === 0) {
      toast.error("Pilih minimal satu hasil pencarian untuk membuat laporan.")
      return
    }
    const incomplete = selectedResults.some(r => !r.title || !r.link || !r.snippet)
    if (incomplete) {
      toast.error("Beberapa hasil yang dipilih tidak memiliki data lengkap. Silakan pilih hasil yang valid.")
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
          language: selectedLanguage,
        }),
      })
      if (response.status === 429) {
        const errorData = await response.json()
        toast.error("Terlalu sering generate laporan. Silakan coba lagi nanti.", {
          description: errorData.message + (errorData.reset ? ` (Coba lagi dalam ${Math.ceil((errorData.reset - Date.now())/1000)} detik)` : "")
        })
        return
      }
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Gagal membuat laporan.")
      }
      const data = await response.json()
      toast.success("Laporan berhasil dibuat!", { description: "Anda akan diarahkan ke halaman laporan." })
      setTimeout(() => router.push(`/reports/${data.reportId}`), 1000)
    } catch (error) {
      toast.error("Terjadi error saat generate laporan", { description: getErrorMessage(error) })
    } finally {
      setIsGenerating(false)
    }
  }, [searchQuery, selectedResults, selectedModel, selectedLanguage, router])

  return {
    searchResults: categorizedResults, // gunakan hasil memoized jika perlu
    selectedResults,
    isGenerating,
    selectedModel,
    selectedLanguage,
    setSelectedLanguage,
    handleSearchComplete,
    handleResultSelect: handleResultSelectMemo,
    handleGenerateReport,
    setSelectedModel,
    setSearchResults,
    setSelectedResults,
    handleBatchSelect: handleBatchSelectMemo,
  }
}