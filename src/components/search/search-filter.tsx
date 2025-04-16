import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import * as React from "react";

const typeOptions = [
  { label: "Semua Tipe", value: "all" },
  { label: "Web", value: "web" },
  { label: "PDF", value: "pdf" },
  { label: "Word", value: "doc,docx" },
  { label: "Excel", value: "xls,xlsx" },
  { label: "Teks", value: "txt" },
  { label: "PowerPoint", value: "ppt,pptx" },
  { label: "Gambar", value: "jpg,png,gif" },
];

const times = [
  { label: "Semua Waktu", value: "all" },
  { label: "1 jam terakhir", value: "1h" },
  { label: "24 jam terakhir", value: "24h" },
  { label: "Seminggu terakhir", value: "7d" },
  { label: "Sebulan terakhir", value: "1m" },
  { label: "Setahun terakhir", value: "1y" },
  { label: "Rentang tertentu...", value: "custom" },
];

export interface SearchFilterValue {
  filetype: string;
  time: string;
  customDateRange?: { start?: Date; end?: Date };
  domain: string;
  safeSearch: boolean;
}

interface SearchFilterProps {
  value: SearchFilterValue;
  onChange: (filters: SearchFilterValue) => void;
}

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  const [type, setType] = React.useState(value.filetype || "all");
  const [time, setTime] = React.useState(value.time || "all");
  const [customDateRange, setCustomDateRange] = React.useState<{ start?: Date; end?: Date }>(value.customDateRange || {});
  const [domain, setDomain] = React.useState(value.domain || "");
  const [safeSearch, setSafeSearch] = React.useState(value.safeSearch || false);
  const [showDatePopover, setShowDatePopover] = React.useState(false);

  // Setiap perubahan filter update ke parent, tapi tidak trigger search
  React.useEffect(() => {
    const filetype = type === "web" || type === "all" ? "" : type;
    onChange({
      filetype,
      time: time === "all" ? "" : time,
      customDateRange: time === "custom" ? customDateRange : undefined,
      domain,
      safeSearch,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, time, customDateRange.start, customDateRange.end, domain, safeSearch]);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-background rounded-lg shadow-md max-w-7xl w-full">
      {/* Domain Input */}
      <div className="flex-1 min-w-[150px]">
        <Input
          placeholder="Domain khusus (opsional)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
      </div>

      {/* Type Select */}
      <div className="flex-1 min-w-[120px]">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Select */}
      <div className="flex-1 min-w-[140px]">
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Waktu (opsional)" />
          </SelectTrigger>
          <SelectContent>
            {times.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range */}
      {time === "custom" && (
        <div className="flex-1 min-w-[200px]">
          <Popover open={showDatePopover} onOpenChange={setShowDatePopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {customDateRange.start && customDateRange.end
                  ? `${format(customDateRange.start, "dd/MM/yyyy")} - ${format(
                      customDateRange.end,
                      "dd/MM/yyyy"
                    )}`
                  : "Pilih rentang tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                selected={{
                  from: customDateRange.start,
                  to: customDateRange.end,
                }}
                onSelect={(range) =>
                  setCustomDateRange({ start: range?.from, end: range?.to })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Safe Search */}
      <div className="flex items-center gap-2 min-w-[130px]">
        <Checkbox
          id="safe-search"
          checked={safeSearch}
          onCheckedChange={(v) => setSafeSearch(Boolean(v))}
        />
        <label htmlFor="safe-search" className="text-sm whitespace-nowrap">
          Safe Search
        </label>
      </div>
    </div>
  );
}
