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
  onReset?: () => void;
  autoSearch?: boolean;
  onAutoSearchChange?: (val: boolean) => void;
}

export function SearchFilter({ value, onChange, onReset, autoSearch, onAutoSearchChange }: SearchFilterProps) {
  const [type, setType] = React.useState(value.filetype || "all");
  const [time, setTime] = React.useState(value.time || "all");
  const [customDateRange, setCustomDateRange] = React.useState<{ start?: Date; end?: Date }>(value.customDateRange || {});
  const [domain, setDomain] = React.useState(value.domain || "");
  const [safeSearch, setSafeSearch] = React.useState(value.safeSearch || false);
  const [showDatePopover, setShowDatePopover] = React.useState(false);

  // Sinkronisasi state internal jika value dari parent berubah (agar reset benar2 sync)
  React.useEffect(() => {
    setType(value.filetype || "all");
    setTime(value.time || "all");
    setCustomDateRange(value.customDateRange || {});
    setDomain(value.domain || "");
    setSafeSearch(value.safeSearch || false);
  }, [value.filetype, value.time, value.customDateRange, value.domain, value.safeSearch]);

  // Helper untuk preview filter aktif
  function getActiveFilterSummary(opts?: { excludeSafeSearch?: boolean }) {
    const filters = [];
    if (type && type !== "all") filters.push(type.toUpperCase());
    if (time && time !== "all") filters.push(time === "custom" && customDateRange?.start && customDateRange?.end
      ? `${customDateRange.start.toLocaleDateString()} - ${customDateRange.end.toLocaleDateString()}`
      : time);
    if (domain) filters.push(`domain: ${domain}`);
    if (!opts?.excludeSafeSearch && safeSearch) filters.push("Safe Search: Aktif");
    return filters.length ? filters.join(", ") : "Tidak ada filter aktif";
  }

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
    <>
      {/* Baris 1 : Form Filter */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-background rounded-lg sm:rounded-full shadow-md w-full mb-2">
        {/* Domain Input */}
        <div className="flex-1 min-w-[150px]">
          <Input
            placeholder="Domain khusus (opsional)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="rounded-full"
          />
        </div>
        {/* Type Select */}
        <div className="flex-1 min-w-[120px]">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full rounded-full">
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
            <SelectTrigger className="w-full rounded-full">
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
                <Button variant="outline" className="w-full justify-start rounded-full">
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
      </div>
      {/* Baris 2 : Semua Elemen Sejajar, Satu Baris, Full Width */}
      <div className="flex flex-wrap items-center gap-4 w-full p-4 bg-background shadow-md rounded-lg sm:rounded-full">
        <label className="flex-1 flex items-center gap-2 text-xs select-none cursor-pointer px-3 py-2 bg-muted border border-border rounded-full min-w-fit">
          <Checkbox
            id="safe-search"
            checked={safeSearch}
            onCheckedChange={v => setSafeSearch(v === true)}
            className="accent-primary"
          />
          <span className="font-medium">Safe Search</span>
        </label>
        {typeof autoSearch === "boolean" && onAutoSearchChange && (
          <label className="flex-1 flex items-center gap-2 text-xs select-none cursor-pointer px-3 py-2 bg-muted border border-border rounded-full min-w-fit">
            <Checkbox
              checked={autoSearch}
              onCheckedChange={onAutoSearchChange}
              className="accent-primary"
            />
            <span className="font-medium">Auto-search</span>
          </label>
        )}
        <div className="flex-1 inline-block px-3 py-2 bg-accent text-xs font-semibold text-accent-foreground border border-border shadow-sm rounded-full min-w-fit">
          Filter Aktif: {getActiveFilterSummary({ excludeSafeSearch: true })}
        </div>
        <div className={`flex-1 inline-block px-3 py-2 border text-xs font-semibold shadow-sm rounded-full min-w-fit ${safeSearch ? 'bg-green-100 text-green-700 border-green-300' : 'bg-muted text-foreground border-border'}`}> 
          Safe Search: <span className="font-bold ml-1">{safeSearch ? 'ON' : 'OFF'}</span>
        </div>
        {onReset && (
          <button
            type="button"
            className="flex-1 px-3 py-2 bg-muted text-foreground border border-border shadow-sm text-xs font-medium hover:bg-accent transition rounded-full min-w-fit"
            onClick={onReset}
          >
            <span className="inline-block align-middle">Reset Filter</span>
          </button>
        )}
      </div>
    </>
  );
}
