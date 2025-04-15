"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, File, FileText, Image, Video, Globe, MapPin, Newspaper, Users, Check, Trash2 } from "lucide-react"
import { SearchResult } from "@/types/search"
import { toast } from "sonner"

interface SearchResultsProps {
  results: SearchResult[]
  onResultSelect: (result: SearchResult, isSelected: boolean) => void
  selectedResults: SearchResult[]
  onBatchSelect?: (results: SearchResult[], isSelected: boolean) => void
}

const typeIconMap = {
  pdf: <File className="h-4 w-4 text-red-600" aria-label="PDF" />,
  word: <File className="h-4 w-4 text-blue-600" aria-label="Word" />,
  spreadsheet: <File className="h-4 w-4 text-green-600" aria-label="Spreadsheet" />,
  presentation: <FileText className="h-4 w-4 text-orange-600" aria-label="Presentation" />,
  image: <Image className="h-4 w-4 text-purple-600" aria-label="Image" />,
  video: <Video className="h-4 w-4 text-pink-600" aria-label="Video" />,
  news: <Newspaper className="h-4 w-4 text-yellow-600" aria-label="News" />,
  map: <MapPin className="h-4 w-4 text-emerald-600" aria-label="Map" />,
  social: <Users className="h-4 w-4 text-sky-600" aria-label="Social" />,
  web: <Globe className="h-4 w-4 text-gray-600" aria-label="Web" />,
  other: <FileText className="h-4 w-4 text-gray-400" aria-label="Other" />,
} as const;

export default function SearchResults({ results, onResultSelect, selectedResults, onBatchSelect }: SearchResultsProps) {
  const maxSelected = 5
  const [filter, setFilter] = useState<string>("all")

  // Kategori unik hasil
  const categories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(results.map((r: SearchResult) => r.type || "other")))
    return ["all", ...cats]
  }, [results])

  // Filter hasil sesuai kategori
  const filteredResults = useMemo<SearchResult[]>(() => {
    return filter === "all" ? results : results.filter((r: SearchResult) => (r.type || "other") === filter)
  }, [results, filter])

  // Batch select/deselect logic
  const batchSelect = (items: SearchResult[], isSelected: boolean) => {
    if (onBatchSelect) {
      onBatchSelect(items, isSelected)
    } else {
      // fallback: panggil satu per satu
      items.forEach(r => onResultSelect(r, isSelected))
    }
  }

  // Select all (hanya hasil yang difilter, tanpa melebihi batas)
  const handleSelectAll = () => {
    const toAdd = filteredResults.filter(r =>
      !selectedResults.some(s => s.link === r.link)
    ).slice(0, maxSelected - selectedResults.length)
    if (toAdd.length === 0) {
      toast.error(`Semua hasil pada filter ini sudah dipilih atau sudah mencapai batas.`)
      return
    }
    batchSelect(toAdd, true)
  }
  // Hapus pilihan hanya pada hasil yang difilter
  const handleDeselectAll = () => {
    const toRemove = filteredResults.filter(r =>
      selectedResults.some(s => s.link === r.link)
    )
    if (toRemove.length === 0) {
      toast.error("Tidak ada hasil yang bisa dihapus pada filter ini.")
      return
    }
    batchSelect(toRemove, false)
  }

  // Highlight keyword (asumsi keyword ada di window.searchQuery atau props, fallback tidak highlight)
  function highlight(text: string) {
    // @ts-expect-error: window may have custom searchQuery property injected elsewhere
    const searchQuery = typeof window !== 'undefined' ? (window as unknown).searchQuery : undefined
    if (searchQuery) {
      const pattern = new RegExp(`(${searchQuery})`, 'gi')
      return text.replace(pattern, '<mark>$1</mark>')
    }
    return text
  }

  const isSelected = (result: SearchResult) => {
    return selectedResults.some((item: SearchResult) => item.link === result.link)
  }

  // Batasi pemilihan hasil search
  const canSelectMore = selectedResults.length < maxSelected

  // Jangan render filter & aksi jika tidak ada hasil
  if (!results || results.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Filter dan aksi */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
        {/* Kiri: Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          {categories.map((cat: string) => (
            <Button
              key={cat}
              size="sm"
              variant={filter === cat ? "default" : "outline"}
              className="text-xs px-3"
              onClick={() => setFilter(cat)}
            >
              {cat.toUpperCase()}
            </Button>
          ))}
        </div>
        {/* Kanan: Info dan aksi */}
        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
          <Badge variant="secondary">
            {selectedResults.length} / {maxSelected} dipilih
          </Badge>
          <Button
            size="sm"
            variant="default"
            onClick={handleSelectAll}
            disabled={filteredResults.length === 0 || selectedResults.length >= maxSelected}
          >
            <Check className="w-4 h-4 mr-1" /> Pilih Semua
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeselectAll}
            disabled={selectedResults.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Hapus Pilihan
          </Button>
        </div>
      </div>
      {filteredResults.map((result: SearchResult, index: number) => {
        const icon = typeIconMap[(result.type as keyof typeof typeIconMap) ?? 'other'] ?? typeIconMap.other
        const checked = isSelected(result)
        const disabled = !checked && !canSelectMore
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start p-4 gap-4">
                <div className="pt-1">
                  <Checkbox
                    id={`result-${index}`}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(checked) => {
                      if (checked && !canSelectMore) {
                        toast.error(`Maksimal ${maxSelected} hasil bisa dipilih.`)
                        return
                      }
                      onResultSelect(result, !!checked)
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <h3 className="font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: highlight(result.title) }} />
                  </div>
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
                    dangerouslySetInnerHTML={{ __html: highlight(result.snippet) }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
