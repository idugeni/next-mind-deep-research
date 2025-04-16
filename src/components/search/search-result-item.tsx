import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Instagram } from "lucide-react";
import { SearchResult } from "@/types/search";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

// Define types for pagemap
interface CSEImage {
  src?: string;
}
interface MetaTag {
  datePublished?: string;
}
interface PageMap {
  cse_image?: CSEImage[];
  metatags?: MetaTag[];
  [key: string]: unknown;
}

interface SearchResultItemProps {
  result: {
    pagemap?: PageMap;
    displayLink: string;
    link: string;
    title: string;
    snippet: string;
    mime?: string;
  };
  icon: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  maxSelected: number;
  canSelectMore: boolean;
  onResultSelect: (result: SearchResult, isSelected: boolean) => void;
  highlight: (text: string) => string;
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
  return (
    <Card className="overflow-hidden py-0 mt-4">
      <CardContent className="p-0">
        <div className="flex items-start p-4 gap-4">
          <div className="pt-1">
            <Checkbox
              id={`result-${result.link}`}
              checked={checked}
              disabled={disabled}
              onCheckedChange={(checked) => {
                if (checked && !canSelectMore) {
                  toast.error(getErrorMessage(`Maksimal ${maxSelected} hasil bisa dipilih.`));
                  return;
                }
                onResultSelect(result, !!checked);
              }}
            />
          </div>
          {/* Thumbnail: fallback Instagram jika dari Instagram, jika tidak coba load gambar */}
          {result.displayLink?.toLowerCase().includes("instagram.com") ? (
            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gradient-to-br from-pink-400 via-purple-500 to-yellow-400 flex items-center justify-center mr-2">
              <Instagram className="w-8 h-8 text-white drop-shadow" />
            </div>
          ) : result.pagemap && result.pagemap.cse_image && result.pagemap.cse_image[0]?.src ? (
            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 border mr-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.pagemap.cse_image[0].src.replace(/^http:\/\//, "https://")}
                alt={result.title}
                className="object-cover w-full h-full"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const fallback = document.createElement("div");
                  fallback.className = "w-16 h-16 flex items-center justify-center bg-gray-200 text-gray-400";
                  fallback.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' class='w-8 h-8'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6' /></svg>`;
                  (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
                }}
              />
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <h3 className="font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: highlight(result.title) }} />
            </div>
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground flex items-center hover:underline truncate mb-2"
            >
              {result.displayLink}
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <p
              className="text-sm text-muted-foreground line-clamp-2"
              dangerouslySetInnerHTML={{ __html: highlight(result.snippet) }}
            />
            {/* Tipe file dan tanggal jika ada */}
            <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500 items-center">
              {result.mime && (
                <span className="px-2 py-0.5 bg-gray-100 border rounded">{result.mime}</span>
              )}
              {/* Tanggal jika ada di pagemap.metatags[0]["datePublished"] atau snippet */}
              {result.pagemap && result.pagemap.metatags && result.pagemap.metatags[0]?.datePublished && (
                <span>
                  {new Date(result.pagemap.metatags[0].datePublished).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
