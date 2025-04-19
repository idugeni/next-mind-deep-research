"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchLanguage } from "@/types/search";

interface LanguageSelectorProps {
  selectedLanguage: SearchLanguage;
  onLanguageChange: (language: SearchLanguage) => void;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  return (
    <Tabs
      value={selectedLanguage}
      onValueChange={(value) => onLanguageChange(value as SearchLanguage)}
      className="w-full max-w-md mx-auto"
    >
      <TabsList className="grid grid-cols-2 w-full rounded-full bg-muted">
        <TabsTrigger
          value="id"
          className="rounded-full text-sm font-medium transition-all duration-200
            data-[state=active]:bg-primary
            data-[state=active]:text-primary-foreground
            data-[state=inactive]:text-muted-foreground
            hover:bg-accent hover:text-accent-foreground"
        >
          ID
        </TabsTrigger>
        <TabsTrigger
          value="en"
          className="rounded-full text-sm font-medium transition-all duration-200
            data-[state=active]:bg-primary
            data-[state=active]:text-primary-foreground
            data-[state=inactive]:text-muted-foreground
            hover:bg-accent hover:text-accent-foreground"
        >
          EN
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
