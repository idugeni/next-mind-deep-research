"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SearchInput from "@/components/search/search-input"
import LanguageSelector from "@/components/search/language-selector"
import { SearchFilter, SearchFilterValue } from "@/components/search/search-filter";
import type { SearchLanguage, SearchResult } from "@/types/search"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { subDays, subHours, format as formatDate } from "date-fns";

interface SearchSectionProps {
  onSearchCompleteAction: (results: SearchResult[], query: string) => void
}

export default function SearchSection({ onSearchCompleteAction }: SearchSectionProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const [hasResult, setHasResult] = useState(false)
  const [filterState, setFilterState] = useState<SearchFilterValue>({
    filetype: "",
    time: "",
    customDateRange: undefined,
    domain: "",
    safeSearch: false,
  });

  const handleSearch = async (queryOrFilters: string | SearchFilterValue) => {
    const query = typeof queryOrFilters === "string" ? queryOrFilters : "";
    const filters: SearchFilterValue = typeof queryOrFilters === "object" && queryOrFilters !== null && 'filetype' in queryOrFilters ? queryOrFilters as SearchFilterValue : filterState;

    let fullQuery = query;
    if (filters.filetype) fullQuery += ` filetype:${filters.filetype}`;
    if (filters.domain) fullQuery += ` site:${filters.domain}`;

    // === Integrasi filter waktu ===
    const now = new Date();
    let after = undefined;
    let before = undefined;
    switch (filters.time) {
      case "1h": after = subHours(now, 1); break;
      case "24h": after = subHours(now, 24); break;
      case "7d": after = subDays(now, 7); break;
      case "1m": after = subDays(now, 30); break;
      case "1y": after = subDays(now, 365); break;
      case "custom":
        if (filters.customDateRange?.start) after = filters.customDateRange.start;
        if (filters.customDateRange?.end) before = filters.customDateRange.end;
        break;
      default: break;
    }
    if (after) fullQuery += ` after:${formatDate(after, "yyyy-MM-dd")}`;
    if (before) fullQuery += ` before:${formatDate(before, "yyyy-MM-dd")}`;

    if (!fullQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(fullQuery)}&language=${selectedLanguage}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to search");
      }

      const data = await response.json();
      // Fallback jika hasil kosong
      if (!data.items || data.items.length === 0) {
        toast("Tidak ada hasil ditemukan.", {
          description: "Coba perbaiki kata kunci, filter, atau gunakan rentang waktu yang berbeda.",
          action: { label: "OK", onClick: () => {} }
        });
      }
      onSearchCompleteAction(data.items || [], query);
      setHasResult(!!(data.items && data.items.length > 0));
    } catch (error) {
      toast.error("Error", {
        description: getErrorMessage(error, "Failed to perform search. Please try again.")
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    onSearchCompleteAction([], "")
    setHasResult(false)
    // Reset filter juga ke default
    setFilterState({
      filetype: "",
      time: "",
      customDateRange: undefined,
      domain: "",
      safeSearch: false,
    })
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* LanguageSelector tetap ada, untuk filter bahasa internal */}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <div className="w-full">
          <SearchInput onSearch={handleSearch} isLoading={isSearching} showReset={hasResult} onReset={handleReset} />
        </div>
        <div className="w-full mt-4">
          <SearchFilter value={filterState} onChange={setFilterState} />
        </div>
      </CardContent>
    </Card>
  )
}