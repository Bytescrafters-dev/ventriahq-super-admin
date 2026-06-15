"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { format, parse, isValid } from "date-fns";
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
import { BILLING_CYCLE } from "@/types/pricePlan";
import { CURRENCIES } from "@/shared/constants/common";

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  SEMI_ANNUAL: "Semi Annual",
  ANNUAL: "Annual",
};

const STATUS_VALUES = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export const PricePlanFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Keep a ref to the latest searchParams to avoid stale closure in effects
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [searchInput, setSearchInput] = useState(
    searchParams.get("planName") ?? "",
  );
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const isFirstRender = useRef(true);

  const billingCycle = searchParams.get("billingCycle") ?? "";
  const currency = searchParams.get("currency") ?? "";
  const isActive = searchParams.get("isActive") ?? "";

  const hasActiveFilters = !!(
    searchParams.get("planName") ||
    billingCycle ||
    currency ||
    isActive
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  // Sync debounced search to URL (skip initial render to avoid overwriting URL on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateParams({ planName: debouncedSearch || null });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAll = () => {
    setSearchInput("");
    router.replace(pathname);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by plan name..."
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
          value={billingCycle}
          onValueChange={(v) =>
            updateParams({ billingCycle: v === "_all" ? null : v })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Cycles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            {Object.values(BILLING_CYCLE).map((s) => (
              <SelectItem key={s} value={s}>
                {BILLING_LABELS[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currency}
          onValueChange={(v) =>
            updateParams({ currency: v === "_all" ? null : v })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Currencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Currencies</SelectItem>
            {Object.values(CURRENCIES).map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={isActive}
          onValueChange={(v) =>
            updateParams({ isActive: v === "_all" ? null : v })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            {Object.values(STATUS_VALUES).map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
