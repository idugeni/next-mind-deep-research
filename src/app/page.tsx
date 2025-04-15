"use client"

import HeroSection from "@/components/home/hero-section"
import SearchSection from "@/components/home/search-section"
import FeaturesSection from "@/components/home/features-section"
import SearchResults from "@/components/search/search-results"
import ModelSelector from "@/components/model-selector"; 
import { Button } from "@/components/ui/button"; 
import { Loader2 } from "lucide-react"; 
import { useHome } from "@/hooks/home/use-home"

export default function Home() {
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <HeroSection />
      <SearchSection onSearchComplete={handleSearchComplete} />
      {searchResults.length === 0 && <FeaturesSection />}
      {/* Tampilkan SearchResults SAJA jika hasil search ada, ResultSection hanya untuk generate report */}
      {searchResults.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <Button
                onClick={handleGenerateReport}
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
          <SearchResults
            results={searchResults}
            selectedResults={selectedResults}
            onResultSelect={handleResultSelect}
            onBatchSelect={handleBatchSelect}
          />
        </>
      )}
    </div>
  )
}