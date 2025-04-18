"use client"

import HeroSection from "@/components/home/hero-section"
import SearchSection from "@/components/home/search-section"
import FeaturesSection from "@/components/home/features-section"
import SearchResults from "@/components/search/search-results"
import ModelSelector from "@/components/model-selector"; 
import { Button } from "@/components/ui/button"; 
import { Loader2 } from "lucide-react"; 
import { Eye, EyeOff, Save } from "lucide-react"; 
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

  // Jangan render sebelum config siap
  if (useBackendApiKey === undefined) return <Loading />;

  // Wrapper agar selalu dapat apiKey terbaru
  const handleGenerateReportWithKey = () => handleGenerateReport(apiKey, useBackendApiKey);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <HeroSection />
      {!useBackendApiKey && (
        <div className="mb-4 w-full max-w-md mx-auto">
          <label htmlFor="gemini-api-key" className="block font-medium mb-1 text-gray-700">Gemini API Key</label>
          <div className="relative flex items-center rounded-lg shadow-sm border border-gray-300 focus-within:border-blue-500 bg-white">
            <input
              id="gemini-api-key"
              type={showApiKey ? "text" : "password"}
              className={`flex-1 px-3 py-2 rounded-l-lg outline-none bg-transparent text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-200 ${apiKeyError ? 'border-red-500' : ''}`}
              value={apiKey || ''}
              onChange={e => { setApiKey(e.target.value); setApiKeyError(null); }}
              placeholder="Masukkan Gemini API Key Anda"
              autoComplete="off"
            />
            <button
              type="button"
              aria-label={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
              onClick={() => setShowApiKey(v => !v)}
              className="px-2 py-2 text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-700 transition-colors"
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
              className="px-2 py-2 text-green-600 hover:text-green-800 focus:outline-none focus:text-green-700 transition-colors"
              tabIndex={-1}
              style={{ background: 'none', border: 'none' }}
            >
              <Save size={20} />
            </button>
          </div>
          {apiKeyError && <div className="text-xs text-red-600 mt-1">{apiKeyError}</div>}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            {apiKeySaved && <span className="text-green-600 font-medium">Tersimpan!</span>}
            {!apiKeySaved && <span>Kunci API Anda hanya disimpan di browser ini.</span>}
          </div>
        </div>
      )}
      <SearchSection onSearchCompleteAction={handleSearchComplete} />
      <div className="mt-4">
        {searchResults.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <Button
                onClick={handleGenerateReportWithKey}
                disabled={selectedResults.length === 0 || isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          </div>
        )}
        <SearchResults
          results={searchResults}
          selectedResults={selectedResults}
          onResultSelectAction={handleResultSelect}
          onBatchSelect={handleBatchSelect}
        />
      </div>
      {searchResults.length === 0 && selectedResults.length === 0 && <FeaturesSection />}
    </div>
  )
}