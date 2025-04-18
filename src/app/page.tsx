"use client"

import HeroSection from "@/components/home/hero-section"
import SearchSection from "@/components/home/search-section"
import FeaturesSection from "@/components/home/features-section"
import SearchResults from "@/components/search/search-results"
import ModelSelector from "@/components/model-selector"; 
import { Button } from "@/components/ui/button"; 
import { Loader2 } from "lucide-react"; 
import { Eye, EyeOff, Save, Trash2 } from "lucide-react"; 
import { useHome } from "@/hooks/home/use-home"
import { useDocumentMeta } from '@/hooks/use-document-meta'
import { MAIN_TITLE, DEFAULT_DESCRIPTION } from '@/lib/metadata'
import { useEffect, useState } from "react"
import Loading from "./loading"

export default function Home() {
  useDocumentMeta(MAIN_TITLE, DEFAULT_DESCRIPTION)
  const {
    searchResults,
    selectedResults,
    isGenerating,
    selectedModel,
    handleSearchComplete,
    handleResultSelect,
    handleGenerateReport,
    setSelectedModel,
    handleBatchSelect,
  } = useHome()

  // Inisialisasi apiKey dari localStorage hanya sekali saat mount
  const [apiKey, setApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '');
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)

  const [useBackendApiKey, setUseBackendApiKey] = useState<boolean | undefined>(undefined)

  // Tambahkan state untuk menandai apakah user sudah melakukan pencarian
  const [hasSearched, setHasSearched] = useState(false);

  // State untuk error pencarian (misal quota exceeded)
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch config hanya untuk set useBackendApiKey, tidak pernah reset apiKey
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (typeof data.useBackendApiKey === 'boolean') {
          setUseBackendApiKey(data.useBackendApiKey)
        }
      })
  }, [])

  // Tambahkan efek agar error API Key otomatis hilang setelah beberapa detik
  useEffect(() => {
    if (apiKeyError) {
      const timeout = setTimeout(() => setApiKeyError(null), 2500);
      return () => clearTimeout(timeout);
    }
  }, [apiKeyError]);

  // Jangan render sebelum config siap
  if (useBackendApiKey === undefined) return <Loading />;

  // Wrapper agar selalu dapat apiKey terbaru
  const handleGenerateReportWithKey = () => handleGenerateReport(apiKey, useBackendApiKey);

  // Handler untuk pencarian selesai
  const handleSearchCompleteWithMark = (results: import("@/types/search").SearchResult[], query: string) => {
    handleSearchComplete(results, query);
    setHasSearched(!!query && query.trim().length > 0);
    setSearchError(null); // reset error jika pencarian berhasil
  };
  // Handler untuk reset pencarian
  const handleResetSearch = () => {
    setHasSearched(false);
    handleSearchComplete([], "");
    setSearchError(null); // reset error jika reset
  };
  // Handler jika terjadi error pencarian (misal quota exceeded)
  const handleSearchError = (msg: string) => {
    setSearchError(msg);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <HeroSection />
      {!useBackendApiKey && (
        <div className="mb-4 w-full max-w-2xl mx-auto">
          <div className="rounded-xl shadow-lg border border-border bg-card p-6 mb-8">
            <label htmlFor="gemini-api-key" className="block font-medium mb-1 text-foreground">Gemini API Key</label>
            <div className="relative flex items-center rounded-lg shadow-sm border border-input focus-within:border-primary bg-background">
              <input
                id="gemini-api-key"
                type={showApiKey ? "text" : "password"}
                className={`flex-1 px-3 py-2 rounded-l-lg outline-none bg-transparent text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 ${apiKeyError ? 'border-destructive' : ''}`}
                value={apiKey || ''}
                onChange={e => { setApiKey(e.target.value); setApiKeyError(null); }}
                placeholder="Masukkan Gemini API Key Anda"
                autoComplete="off"
              />
              <button
                type="button"
                aria-label={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                onClick={() => setShowApiKey(v => !v)}
                className="px-2 py-2 text-muted-foreground hover:text-primary focus:outline-none focus:text-primary transition-colors"
                tabIndex={-1}
                style={{ background: 'none', border: 'none' }}
              >
                {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button
                type="button"
                aria-label="Simpan API Key"
                onClick={() => { 
                  if (!apiKey || apiKey.trim().length < 20) {
                    setApiKeyError('API Key tidak valid!');
                    return;
                  }
                  localStorage.setItem('gemini_api_key', apiKey); 
                  setApiKeySaved(true); 
                  setTimeout(() => setApiKeySaved(false), 1500); 
                }}
                className="px-2 py-2 text-success hover:text-success/80 focus:outline-none focus:text-success transition-colors"
                tabIndex={-1}
                style={{ background: 'none', border: 'none' }}
              >
                <Save size={20} />
              </button>
              <button
                type="button"
                aria-label="Hapus API Key"
                onClick={() => {
                  localStorage.removeItem('gemini_api_key');
                  setApiKey('');
                  setApiKeyError(null);
                  setApiKeySaved(false);
                }}
                className="px-2 py-2 text-destructive hover:text-destructive/80 focus:outline-none focus:text-destructive transition-colors"
                tabIndex={-1}
                style={{ background: 'none', border: 'none' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
            {apiKeyError && <div className="text-xs text-destructive mt-1">{apiKeyError}</div>}
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              {apiKeySaved && <span className="text-success font-medium">Tersimpan!</span>}
              {!apiKeySaved && <span>Kunci API Anda hanya disimpan di browser ini.</span>}
            </div>
          </div>
        </div>
      )}
      <SearchSection onSearchCompleteAction={handleSearchCompleteWithMark} onSearchStarted={() => setHasSearched(true)} onResetSearch={handleResetSearch} onSearchError={handleSearchError} />
      <div className="mt-4">
        {searchResults.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <Button
                onClick={handleGenerateReportWithKey}
                disabled={selectedResults.length === 0 || isGenerating}
                className="w-full md:w-auto"
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Generate Report
              </Button>
            </div>
          </div>
        )}
        <SearchResults
          results={searchResults}
          selectedResults={selectedResults}
          onResultSelectAction={handleResultSelect}
          onBatchSelect={handleBatchSelect}
          hasSearched={hasSearched}
          searchError={searchError}
        />
      </div>
      {searchResults.length === 0 && selectedResults.length === 0 && <FeaturesSection />}
    </div>
  )
}