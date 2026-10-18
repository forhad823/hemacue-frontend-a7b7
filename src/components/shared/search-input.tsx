"use client";

import { Search, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * Search box that mirrors a value stored somewhere else (here: the URL).
 *
 * Data flow, one direction per event, no effect compares two lagging copies:
 *   typing  → local state now, parent notified once after `debounceMs`
 *   clear   → local state + parent updated immediately, pending timer cancelled
 *   parent  → local state, but ONLY when the parent changed to something this
 *             component did not send itself (back/forward, "reset" button…)
 *
 * `lastSynced` is the last value known to be in sync with the parent. It is
 * what lets us tell "the URL echoed back what I just sent" (ignore) apart from
 * "the URL was changed from outside" (adopt).
 */
export function SearchInput({
  value: externalValue = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 400,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);

  const lastSynced = useRef(externalValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Callers pass inline arrows (`(v) => setSearch(v)`), so `onChange` has a new
  // identity on every render. Keep it in a ref so it never retriggers effects.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Parent → input. Runs only when the parent's value actually changes.
  useEffect(() => {
    if (externalValue === lastSynced.current) return; // echo of our own update
    if (timer.current) return; // user is mid-typing: their input wins
    lastSynced.current = externalValue;
    setInternalValue(externalValue);
  }, [externalValue]);

  // Don't fire a pending update after unmount.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInternalValue(next);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      if (next === lastSynced.current) return;
      lastSynced.current = next;
      onChangeRef.current(next);
    }, debounceMs);
  };

  const handleClear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setInternalValue("");
    if (lastSynced.current !== "") {
      lastSynced.current = "";
      onChangeRef.current("");
    }
  };

  return (
    <div
      className={cn("relative flex items-center w-full max-w-sm", className)}
    >
      <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="size-4 text-muted-foreground" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}
