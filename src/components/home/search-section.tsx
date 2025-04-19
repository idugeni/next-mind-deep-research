"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SearchInput from "@/components/search/search-input"
import LanguageSelector from "@/components/search/language-selector"
import { SearchFilter, SearchFilterValue } from "@/components/search/search-filter";
import type { SearchLanguage, SearchResult } from "@/types/search"
import { getErrorMessage } from "@/lib/utils"
import { AlertTriangle, SearchX, Ban } from "lucide-react";
import ResultSection from "@/components/home/result-section"; // Fix import path

interface SearchSectionProps {
  onSearchCompleteAction: (results: SearchResult[], query: string) => void
  onSearchStarted?: () => void
  onResetSearch?: () => void
  onSearchError?: (msg: string | null) => void
}

export default function SearchSection({ onSearchCompleteAction, onSearchStarted, onResetSearch, onSearchError }: SearchSectionProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<SearchLanguage>("id")
  const [hasSearched, setHasSearched] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [filterState, setFilterState] = useState<SearchFilterValue>({
    filetype: "",
    time: "",
    customDateRange: undefined,
    domain: "",
    safeSearch: false,
  });
  const [quotaError, setQuotaError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); 
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]); 
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [autoSearch, setAutoSearch] = useState(false);

  // Handler onChange untuk filter (support auto-search)
  const handleFilterChange = (filters: SearchFilterValue) => {
    setFilterState(filters);
    if (autoSearch) {
      handleSearch(filters);
    }
  };

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
    if (filters.time === "past24h") {
      after = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (filters.time === "pastWeek") {
      after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.time === "pastMonth") {
      after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (filters.time === "custom" && filters.customDateRange) {
      after = filters.customDateRange.start;
      before = filters.customDateRange.end;
    }

    // === Integrasi Safe Search ===
    // Gunakan parameter safe=active/off pada URL API
    const safeParam = filters.safeSearch ? "active" : "off";

    let url = `/api/search?q=${encodeURIComponent(fullQuery)}&language=${selectedLanguage}`;
    if (after) url += `&after=${after.toISOString()}`;
    if (before) url += `&before=${before.toISOString()}`;
    url += `&safe=${safeParam}`;

    if (onSearchStarted) onSearchStarted();
    setIsSearching(true);
    setQuotaError(false);
    setNotFound(false);
    setSearchErrorMessage(null);

    try {
      const response = await fetch(url);
      const data = await response.json();

      // PATCH: Cek error dari body, JANGAN lanjut ke logika hasil jika error
      if (data.error) {
        if (data.message?.toLowerCase().includes("quota")) {
          setQuotaError(true);
          setNotFound(false);
          setSearchErrorMessage(null);
          if (onSearchError) onSearchError("quota");
          return;
        }
        setSearchErrorMessage(data.message || "Terjadi kesalahan saat pencarian");
        setNotFound(false);
        setQuotaError(false);
        if (onSearchError) onSearchError(data.message);
        return;
      }

      // Jika tidak error, baru cek hasil kosong
      if (!data.items || data.items.length === 0) {
        setNotFound(true);
        setSearchErrorMessage(null);
        setQuotaError(false);
      } else {
        setNotFound(false);
        setSearchErrorMessage(null);
        setQuotaError(false);
      }

      onSearchCompleteAction(data.items || [], query);
      setSearchResults(data.items || []); 
      setHasResult(!!(data.items && data.items.length > 0));
      setHasSearched(true);
      setSearchQuery(query);
      if (onSearchError) onSearchError(null); // reset error jika sukses
      setQuotaError(false);
      setNotFound(false);
      setSearchErrorMessage(null);
    } catch (error) {
      setSearchErrorMessage(getErrorMessage(error, "Terjadi kesalahan saat pencarian"));
      setQuotaError(false);
      setNotFound(false);
      if (onSearchError) onSearchError(getErrorMessage(error, "Terjadi kesalahan saat pencarian")); // propagate error ke UI
      // Jangan throw agar console tetap bersih
    } finally {
      setIsSearching(false);
    }
  };

  // Handler reset filter, juga reset hasil pencarian
  const handleReset = () => {
    onSearchCompleteAction([], "");
    setHasResult(false);
    setHasSearched(false);
    setFilterState({
      filetype: "",
      time: "",
      customDateRange: undefined,
      domain: "",
      safeSearch: false,
    });
    setQuotaError(false);
    setNotFound(false);
    setSearchErrorMessage(null);
    setSearchResults([]);
    setSelectedResults([]);
    setSearchQuery("");
    if (onResetSearch) onResetSearch();
  }

  const handleGenerateReportAction = () => {
    // Implementasi handleGenerateReportAction
  }

  const handleModelChangeAction = () => {
    // Implementasi handleModelChangeAction
  }

  const handleResultSelectAction = () => {
    // Implementasi handleResultSelectAction
  }

  return (
    <Card className="mb-4 py-0">
      <CardContent className="p-4">
        {/* LanguageSelector tetap ada, untuk filter bahasa internal */}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <div className="w-full">
          <SearchInput onSearch={handleSearch} isLoading={isSearching} showReset={hasResult} onReset={handleReset} />
        </div>
        <div className="w-full mt-2">
          <SearchFilter
            value={filterState}
            onChange={handleFilterChange}
            onReset={handleReset}
            autoSearch={autoSearch}
            onAutoSearchChange={setAutoSearch}
          />
        </div>
        {quotaError && (
          <div className="w-full flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <Ban size={48} className="mb-3 text-destructive/80" />
            <div className="text-xl font-semibold mb-2 text-destructive">Kuota harian Google Custom Search sudah habis</div>
            <div className="text-sm text-muted-foreground">Silakan coba lagi besok atau hubungi admin untuk upgrade kuota.</div>
          </div>
        )}
        {notFound && (
          <div className="w-full flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <SearchX size={48} className="mb-3 text-destructive/80" />
            <div className="text-xl font-semibold mb-2 text-destructive">Tidak ada hasil ditemukan</div>
            <div className="text-sm text-muted-foreground">Coba perbaiki kata kunci, filter, atau gunakan rentang waktu yang berbeda.</div>
          </div>
        )}
        {searchErrorMessage && (
          <div className="w-full flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <AlertTriangle size={48} className="mb-3 text-destructive/80" />
            <div className="text-xl font-semibold mb-2 text-destructive">{searchErrorMessage}</div>
          </div>
        )}
        {/* Render ResultSection hanya jika SUDAH SEARCH dan tidak error/empty */}
        {hasSearched && !(quotaError || notFound || searchErrorMessage) && (
          <ResultSection
            searchResults={searchResults}
            selectedResults={selectedResults}
            onGenerateReportAction={handleGenerateReportAction}
            isGenerating={false}
            selectedModel={""}
            onModelChangeAction={handleModelChangeAction}
            onResultSelectAction={handleResultSelectAction}
            searchQuery={searchQuery}
            hasSearched={hasSearched}
            searchError={searchErrorMessage}
          />
        )}
      </CardContent>
    </Card>
  )
}