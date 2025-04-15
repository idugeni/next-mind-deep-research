"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SearchResult } from "@/types/search"
import { SearchLanguage } from "@/components/search/language-selector"

function detectResultType(result: SearchResult): SearchResult["type"] {
  const url = result.link.toLowerCase();
  if (url.endsWith('.pdf')) return 'pdf';
  if (url.endsWith('.doc') || url.endsWith('.docx')) return 'word';
  if (url.endsWith('.xls') || url.endsWith('.xlsx')) return 'spreadsheet';
  if (url.endsWith('.ppt') || url.endsWith('.pptx')) return 'presentation';
  if (url.match(/\.(jpg|jpeg|png|gif|bmp|svg)(\?|$)/)) return 'image';
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) return 'video';
  if (url.includes('news.google.com') || url.includes('cnn.com') || url.includes('bbc.co') || url.includes('detik.com') || url.includes('kompas.com')) return 'news';
  if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) return 'map';
  if (url.includes('twitter.com') || url.includes('facebook.com') || url.includes('linkedin.com') || url.includes('instagram.com')) return 'social';
  if (url.startsWith('http')) return 'web';
  return 'other';
}

function categorizeResults(results: SearchResult[]): SearchResult[] {
  return results.map(r => ({ ...r, type: detectResultType(r) }));
}

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
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro-exp-03-25")
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const router = useRouter()

  const handleSearchComplete = (results: SearchResult[], query: string) => {
    const categorized = categorizeResults(results)
    setSearchResults(categorized)
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

  const handleGenerateReport = async () => {
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
          results: selectedResults,
          model: selectedModel,
          language: selectedLanguage
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
      const errorMessage = error instanceof Error ? error.message : "Gagal membuat laporan. Silakan coba lagi."
      toast.error("Terjadi error saat generate laporan", { description: errorMessage })
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
    setSearchResults,
    setSelectedResults,
    handleBatchSelect,
  }
}