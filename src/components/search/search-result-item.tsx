import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";
import { SearchResult } from "@/types/search";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface SearchResultItemProps {
  result: SearchResult;
  icon: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  maxSelected: number;
  canSelectMore: boolean;
  onResultSelect: (result: SearchResult, isSelected: boolean) => void;
  highlight: (text: string) => string;
}

// Komponen gambar hasil: tampilkan gambar jika ada, jika tidak tampilkan SVG branding "N"
function ResultImage({ src, alt }: { src?: string; alt?: string }) {
  const valid = src && /^https?:\/\//.test(src);
  const [error, setError] = React.useState(false);
  if (valid && !error) {
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded overflow-hidden mr-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || "Result image"}
          width={64}
          height={64}
          className="object-cover w-full h-full"
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    );
  }
  // Fallback SVG dengan branding "N"
  return (
    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-700 rounded overflow-hidden mr-4 shadow-md">
      <svg viewBox="0 0 64 64" width="40" height="40" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#grad)" />
        <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="2.6rem" fontWeight="bold" fill="#fff" fontFamily="'Inter',sans-serif" opacity="0.92">N</text>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#A21CAF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function SearchResultItem({
  result,
  icon,
  checked,
  disabled,
  maxSelected,
  canSelectMore,
  onResultSelect,
  highlight,
}: SearchResultItemProps) {
  // Helper: hapus ellipsis di depan jika setelah tanggal, JANGAN hapus di belakang
  function cleanDescription(text: string) {
    if (!text) return "";
    return text.replace(/^(	*\d{1,2} (Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des|January|February|March|April|May|June|July|August|September|October|November|December) \d{4}) (\.{3,}|\u2026)\s*/, "$1 ").trim();
  }

  function limitDescription(text: string, maxLength = 350) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    let truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);
    if (truncated.length < text.length) {
      return truncated.replace(/[\s.,;:!?…]+$/, "") + "…";
    }
    return truncated;
  }

  const displayTitle = result.title;
  const cleanedDescription = cleanDescription(result.snippet);
  const displayDescription = limitDescription(cleanedDescription);

  return (
    <Card
      className={`flex flex-row items-center gap-4 p-4 mb-2 relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      tabIndex={0}
      aria-label={displayTitle}
      data-selected={checked}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(checked) => {
          if (checked && !canSelectMore) {
            toast.error(getErrorMessage(`Maksimal ${maxSelected} hasil bisa dipilih.`));
            return;
          }
          onResultSelect(result, !!checked);
        }}
        className="mr-2 mt-1"
      />
      <ResultImage src={result.pagemap?.cse_image?.[0]?.src} alt={displayTitle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            title={displayTitle}
          >
            <span dangerouslySetInnerHTML={{ __html: highlight(displayTitle) }} />
          </a>
        </div>
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-gray-400 truncate max-w-full"
        >
          {result.displayLink}
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
        <div className="text-sm text-muted-foreground m-0">
          <span dangerouslySetInnerHTML={{ __html: highlight(displayDescription) }} />
        </div>
        {/* Tipe file dan tanggal jika ada */}
        <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500 items-center">
          {result.mime && (
            <span className="border rounded px-2 py-0.5 bg-gray-100 text-gray-600">{result.mime}</span>
          )}
          {result.pagemap && result.pagemap.metatags && result.pagemap.metatags[0]?.datePublished && (
            <span>
              {new Date(result.pagemap.metatags[0].datePublished).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
