import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2 } from "lucide-react";

interface SearchResultFilterBarProps {
  categories: string[];
  filter: string;
  setFilter: (cat: string) => void;
  selectedCount: number;
  maxSelected: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  disableSelectAll: boolean;
  disableDeselectAll: boolean;
  onSmartSelect?: () => void;
}

export default function SearchResultFilterBar({
  categories,
  filter,
  setFilter,
  selectedCount,
  maxSelected,
  onSelectAll,
  onDeselectAll,
  disableSelectAll,
  disableDeselectAll,
  onSmartSelect,
}: SearchResultFilterBarProps) {
  return (
<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 w-full">
  {/* Filter Buttons - atas di mobile */}
  <div className="flex flex-wrap items-center gap-2 w-full">
    <span className="text-sm font-medium">Filter:</span>
    {categories.map((cat) => (
      <Button
        key={cat}
        size="sm"
        variant={filter === cat ? "default" : "outline"}
        className="text-xs px-3"
        onClick={() => setFilter(cat)}
      >
        {cat.toUpperCase()}
      </Button>
    ))}
  </div>

  {/* Action Buttons - bawah di mobile */}
  <div className="flex flex-wrap items-center gap-2 w-full justify-start md:justify-end">
    <Badge variant="secondary">
      {selectedCount} / {maxSelected} dipilih
    </Badge>
    <Button
      size="sm"
      variant="default"
      onClick={onSelectAll}
      disabled={disableSelectAll}
      className="flex items-center gap-1"
    >
      <Check className="w-4 h-4" />
      Pilih Semua
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={onDeselectAll}
      disabled={disableDeselectAll}
      className="flex items-center gap-1"
    >
      <Trash2 className="w-4 h-4" />
      Hapus Pilihan
    </Button>
    {onSmartSelect && (
      <Button
        size="sm"
        variant="secondary"
        onClick={onSmartSelect}
        className="flex items-center gap-1"
      >
        <Check className="w-4 h-4" />
        Pilih Cerdas
      </Button>
    )}
  </div>
</div>
  );
}
