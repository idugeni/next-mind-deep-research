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
  handleGenerateReport: (apiKeyFromPage?: string, useBackendApiKey?: boolean) => void
  setSelectedModel: (model: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setSelectedResults: (results: SearchResult[]) => void
  handleBatchSelect: (results: SearchResult[], isSelected: boolean) => void
  apiKey: string
  setApiKey: (value: string) => void
}

export function useHome(): UseHomeReturn {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID)
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const [apiKey, setApiKeyState] = useState<string>("");
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

  // Saat klik generate report, pastikan apiKey dari page.tsx diteruskan ke useHome
  const handleGenerateReport = useCallback(async (apiKeyFromPage?: string, useBackendApiKeyArg?: boolean) => {
    const body: Record<string, unknown> = {
      query: searchQuery,
      selectedResults,
      model: selectedModel,
      language: selectedLanguage,
    };
    // Kirim apiKey dari parameter jika backend membutuhkannya
    if (useBackendApiKeyArg === false && apiKeyFromPage) {
      body.apiKey = apiKeyFromPage;
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const data = await res.json()
      toast.success("Laporan berhasil dibuat!", { description: "Anda akan diarahkan ke halaman laporan." })
      setTimeout(() => router.push(`/reports/${data.reportId}`), 1000)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setIsGenerating(false)
    }
  }, [searchQuery, selectedResults, selectedModel, selectedLanguage, router])

  // Setter apiKey agar bisa dipanggil dari komponen luar
  const setApiKey = (value: string) => {
    setApiKeyState(value)
  }

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
    apiKey,
    setApiKey,
  }
}