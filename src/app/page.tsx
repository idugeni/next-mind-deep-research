"use client"

import HeroSection from "@/components/home/hero-section"
import SearchSection from "@/components/home/search-section"
import FeaturesSection from "@/components/home/features-section"
import ResultSection from "@/components/home/result-section"
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
  } = useHome()

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <HeroSection />
      <SearchSection onSearchComplete={handleSearchComplete} />
      <FeaturesSection />
      <ResultSection
        searchResults={searchResults}
        selectedResults={selectedResults}
        onResultSelect={handleResultSelect}
        onGenerateReport={handleGenerateReport}
        isGenerating={isGenerating}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </div>
  )
}