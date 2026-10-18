"use client";
import { useCallback, useMemo } from "react";
import { useSearchParamsState } from "./use-search-params-state";

export type SortOrder = "asc" | "desc";

export interface TableSort {
  field: string;
  order: SortOrder;
}

export interface UseTableStateConfig {
  /** All fields this table can sort by — used for runtime validation. */
  sortFields: readonly string[];
  defaultSort?: TableSort;
  /** URL param names for filter dropdowns (e.g. ["status", "urgency"]). */
  filterKeys?: readonly string[];
  defaultFilters?: Record<string, string>;
  pageSize?: number;
}

/**
 * Typed facade over `useSearchParamsState` that centralises pagination, sort,
 * filter and debounced-search state into a single URL-synced object.
 *
 * GUARD RAIL: this hook does NOT re-implement URL logic — it only composes
 * `useSearchParamsState`. Do not add router.push/replace calls here.
 */
export function useTableState(config: UseTableStateConfig) {
  const defaults = useMemo(() => {
    const base: Record<string, string> = {
      page: "1",
      sortBy: config.defaultSort?.field ?? config.sortFields[0],
      sortOrder: config.defaultSort?.order ?? "desc",
      searchTerm: "",
    };
    for (const key of config.filterKeys ?? []) {
      base[key] = config.defaultFilters?.[key] ?? "";
    }
    return base;
  }, [
    config.defaultSort,
    config.filterKeys,
    config.defaultFilters,
    config.sortFields,
  ]);

  const { values, setValues } = useSearchParamsState(defaults);

  const page = Number(values.page) || 1;
  const pageSize = config.pageSize ?? 10;

  const setPage = useCallback(
    (next: number) => setValues({ page: String(next) } as never),
    [setValues],
  );

  const setSort = useCallback(
    (field: string) => {
      const isSame = values.sortBy === field;
      const nextOrder =
        isSame && values.sortOrder === "asc"
          ? "desc"
          : isSame && values.sortOrder === "desc"
            ? "asc"
            : "asc";
      setValues({ sortBy: field, sortOrder: nextOrder, page: "1" } as never);
    },
    [setValues, values.sortBy, values.sortOrder],
  );

  const setSearch = useCallback(
    (searchTerm: string) =>
      setValues({ searchTerm, page: "1" } as never),
    [setValues],
  );

  const setFilter = useCallback(
    (key: string, value: string) =>
      setValues({ [key]: value, page: "1" } as never),
    [setValues],
  );

  const reset = useCallback(() => {
    const cleared: Record<string, string> = {
      page: "1",
      sortBy: defaults.sortBy,
      sortOrder: defaults.sortOrder,
      searchTerm: "",
    };
    for (const key of config.filterKeys ?? []) {
      cleared[key] = "";
    }
    setValues(cleared as never);
  }, [defaults, config.filterKeys, setValues]);

  const sort: TableSort = {
    field: String(values.sortBy),
    order: (values.sortOrder as SortOrder) ?? "desc",
  };

  const filters: Record<string, string> = Object.fromEntries(
    (config.filterKeys ?? []).map((k) => [k, String(values[k] ?? "")]),
  );

  const activeFilterCount =
    (config.filterKeys ?? []).filter((k) => values[k]).length +
    (values.searchTerm ? 1 : 0);

  return {
    page,
    pageSize,
    sort,
    filters,
    searchTerm: String(values.searchTerm ?? ""),
    setPage,
    setSort,
    setSearch,
    setFilter,
    reset,
    activeFilterCount,
  };
}
