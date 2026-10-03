"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value: externalValue = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 400,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);
  const debouncedValue = useDebounce(internalValue, debounceMs);

  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    if (debouncedValue !== externalValue) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, externalValue]);

  return (
    <div className={cn("relative flex items-center w-full max-w-sm", className)}>
      <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {internalValue && (
        <button
          type="button"
          onClick={() => {
            setInternalValue("");
            onChange("");
          }}
          className="absolute right-2.5 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="size-4 text-muted-foreground" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}
