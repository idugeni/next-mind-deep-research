"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MODELS } from "@/constants/models"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="w-full sm:w-auto">
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full sm:w-[260px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
