"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  showReset?: boolean
  onReset?: () => void
}

export default function SearchInput({ onSearch, isLoading = false, showReset = false, onReset }: SearchInputProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-wrap items-center gap-4 p-4 bg-background rounded-lg sm:rounded-full shadow-md max-w-7xl w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your research topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 rounded-full"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" size="sm" disabled={!query.trim() || isLoading} className="w-full rounded-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
        {showReset && (
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => {
              setQuery("");
              if (onReset) onReset();
            }}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        )}
      </div>
    </form>
  )
}
