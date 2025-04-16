"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { File, FileText, Image, Video, Globe, MapPin, Newspaper, Users } from "lucide-react"
import { SearchResult } from "@/types/search"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import SearchResultItem from "./search-result-item";
import SearchResultFilterBar from "./search-result-filter-bar";

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
  // Ubah batas maksimal pilihan menjadi 10
  const maxSelected = 10
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
      toast.error(getErrorMessage(`Semua hasil pada filter ini sudah dipilih atau sudah mencapai batas.`))
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
      toast.error(getErrorMessage(`Tidak ada hasil yang bisa dihapus pada filter ini.`))
      return
    }
    batchSelect(toRemove, false)
  }

  // Fitur pemilihan cerdas (smart select DEEP RESEARCH)
  const handleSmartSelect = () => {
    // 1. Prioritaskan hasil yang mengandung kata kunci "deep research", "studi", "analisis", "makalah", "paper", "laporan", "dataset", "review", "literature" pada title/snippet
    // 2. Prioritaskan file akademik: pdf, word, presentation
    // 3. Prioritaskan hasil dari domain .edu, .ac.id, .org, atau domain riset
    // 4. Jika ada properti important/score, tetap diperhitungkan sebagai bonus
    // 5. Jangan memilih semua hasil jika hasil < maxSelected, tetap pilih yang paling relevan
    const keywords = [
      /deep research/i, /studi/i, /analisis/i, /makalah/i, /paper/i, /laporan/i, /dataset/i, /review/i, /literature/i
    ];
    const academicTypes = ["pdf", "word", "presentation"];
    const academicDomains = [".edu", ".ac.id", ".org", "research", "journal", "repository", "scholar"];

    // Skoring tiap hasil
    function smartScore(result: SearchResult) {
      let score = 0;
      // Kata kunci pada title/snippet
      if (keywords.some(re => re.test(result.title) || re.test(result.snippet))) score += 10;
      // File akademik
      if (result.type && academicTypes.includes(result.type)) score += 8;
      // Domain akademik
      if (result.displayLink && academicDomains.some(dom => result.displayLink.includes(dom))) score += 6;
      // Flag important dari API (jika ada)
      if (result.important) score += 5;
      // Score dari API (jika ada)
      if (typeof result.score === 'number') score += result.score;
      // Tambahan: file PDF lebih tinggi
      if ((result.mime||"").includes("pdf")) score += 2;
      // Tambahan: judul mengandung "summary", "meta analysis"
      if (/summary|meta analysis/i.test(result.title)) score += 2;
      // Penalti jika dari domain komersial
      if (result.displayLink && /tokopedia|bukalapak|shopee|facebook|instagram|twitter|tiktok/.test(result.displayLink)) score -= 5;
      return score;
    }

    // Urutkan berdasarkan skor cerdas
    const sorted = [...filteredResults]
      .map(r => ({...r, _smartScore: smartScore(r)}))
      .sort((a, b) => b._smartScore - a._smartScore)
      .filter((r, i) => r._smartScore > 0 || i < maxSelected); // minimal ambil yang skornya > 0, jika tidak cukup tetap ambil sesuai urutan
    // Hanya pilih yang belum dipilih
    const notYetSelected = sorted.filter(r => !isSelected(r)).slice(0, maxSelected - selectedResults.length);
    if (notYetSelected.length === 0) {
      toast.error("Tidak ada hasil cerdas yang bisa dipilih.");
      return;
    }
    batchSelect(notYetSelected, true);
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
  if (!results || results.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <div className="text-2xl font-semibold mb-2">Tidak ada hasil ditemukan</div>
        <div className="text-sm">Coba perbaiki kata kunci, filter, atau gunakan rentang waktu yang berbeda.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter dan aksi */}
      <SearchResultFilterBar
        categories={categories}
        filter={filter}
        setFilter={setFilter}
        selectedCount={selectedResults.length}
        maxSelected={maxSelected}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        disableSelectAll={!canSelectMore || filteredResults.length === 0}
        disableDeselectAll={selectedResults.length === 0}
        onSmartSelect={handleSmartSelect}
      />
      {filteredResults.map((result: SearchResult, index: number) => {
        const icon = typeIconMap[(result.type as keyof typeof typeIconMap) ?? 'other'] ?? typeIconMap.other
        const checked = isSelected(result)
        const disabled = !checked && !canSelectMore
        return (
          <SearchResultItem
            key={index}
            result={result}
            icon={icon}
            checked={checked}
            disabled={disabled}
            maxSelected={maxSelected}
            canSelectMore={canSelectMore}
            onResultSelect={onResultSelect}
            highlight={highlight}
          />
        )
      })}
    </div>
  )
}
