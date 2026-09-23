"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { INVOICE_STATUS } from "@/types/invoice";
import { DatePicker } from "@/components/common/DatePicker";
import { format, parse, isValid } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAST_DUE: "Past due",
  PAID: "Paid",
  VOID: "Void",
};

function parseDate(str: string | null): Date | undefined {
  if (!str) return undefined;
  const d = parse(str, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export const InvoicesFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Keep a ref to the latest searchParams to avoid stale closure in effects
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [searchInput, setSearchInput] = useState(searchParams?.get("q") ?? "");
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const isFirstRender = useRef(true);

  const status = searchParams?.get("status") ?? "";
  const dateType = searchParams?.get("dateType") ?? "createdAt";
  const dateFrom = parseDate(searchParams?.get("dateFrom") ?? "");
  const dateTo = parseDate(searchParams?.get("dateTo") ?? "");

  const hasActiveFilters = !!(
    searchParams?.get("q") ||
    status ||
    searchParams?.get("dateFrom") ||
    searchParams?.get("dateTo")
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParamsRef?.current?.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    // Reset to page 1 on any filter change
    if (!("page" in updates)) params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Sync debounced search to URL (skip initial render to avoid overwriting URL on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateParams({ q: debouncedSearch || null });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAll = () => {
    setSearchInput("");
    pathname && router.replace(pathname);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          className="pl-9 pr-9"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchInput("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={status}
          onValueChange={(v) =>
            updateParams({ status: v === "_all" ? null : v })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            {Object.values(INVOICE_STATUS).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateType}
          onValueChange={(v) =>
            updateParams({ dateType: v, dateFrom: null, dateTo: null })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created At</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          value={dateFrom}
          onChange={(d) =>
            updateParams({ dateFrom: d ? format(d, "yyyy-MM-dd") : null })
          }
          placeholder="From"
          className="w-48"
          disabled={(date) => (dateTo ? date > dateTo : false)}
        />

        <DatePicker
          value={dateTo}
          onChange={(d) =>
            updateParams({ dateTo: d ? format(d, "yyyy-MM-dd") : null })
          }
          placeholder="To"
          className="w-48"
          disabled={(date) => (dateFrom ? date < dateFrom : false)}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};
