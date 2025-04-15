"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type SearchLanguage = "id" | "en"

interface LanguageSelectorProps {
  selectedLanguage: SearchLanguage
  onLanguageChange: (language: SearchLanguage) => void
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  return (
    <Tabs
      value={selectedLanguage}
      onValueChange={(value) => onLanguageChange(value as SearchLanguage)}
      className="w-full max-w-[200px] mx-auto mb-4"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="id">Indonesia</TabsTrigger>
        <TabsTrigger value="en">English</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}