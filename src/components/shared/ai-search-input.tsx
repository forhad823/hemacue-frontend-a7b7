"use client";

import {
  Droplet,
  Hash,
  Hospital,
  type LucideIcon,
  MapPin,
  User,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/shared/search-input";
import { useAiSuggestions } from "@/hooks/use-ai-suggestions";
import type {
  Suggestion,
  SuggestionCategory,
  SuggestionIndex,
} from "@/lib/ai/suggestions";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  SuggestionCategory,
  { label: string; icon: LucideIcon }
> = {
  hospital: { label: "Hospital", icon: Hospital },
  district: { label: "District", icon: MapPin },
  bloodGroup: { label: "Blood group", icon: Droplet },
  patient: { label: "Patient", icon: User },
  trxId: { label: "Transaction", icon: Hash },
};

/** Bolds the matched fragment; fuzzy-only hits render unstyled. */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLowerCase();
  if (!needle) return <>{text}</>;

  const at = text.toLowerCase().indexOf(needle);
  if (at === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-semibold text-foreground">
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  );
}

interface AiSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Whatever rows are currently on screen — see `buildSuggestionIndex`. */
  index: SuggestionIndex;
  placeholder?: string;
  className?: string;
}

/**
 * `SearchInput` + a category-tagged autocomplete dropdown.
 *
 * Base UI `DropdownMenu` opens on trigger click, not on typing, so this uses
 * the accessible listbox fallback the plan allows: an absolutely-positioned
 * `role="listbox"` driven by `open = suggestions.length > 0`. Arrow keys move
 * the active option, Enter selects, Escape closes. `SearchInput` stays the
 * single search-box implementation — this component only wraps it.
 */
export function AiSearchInput({
  value,
  onChange,
  index,
  placeholder,
  className,
}: AiSearchInputProps) {
  const suggestions = useAiSuggestions(value, index);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = isOpen && suggestions.length > 0;

  useEffect(() => {
    if (!showDropdown) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showDropdown]);

  const select = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!showDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0 ? -1 : (current + 1) % suggestions.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0
          ? -1
          : (current - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter") {
      const target = suggestions[activeIndex];
      if (target) {
        event.preventDefault();
        select(target);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: WAI-ARIA combobox pattern — Arrow/Enter/Escape must bubble from the wrapped SearchInput to this container.
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-sm", className)}
      onKeyDown={handleKeyDown}
    >
      <SearchInput
        value={value}
        onChange={(next) => {
          onChange(next);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        placeholder={placeholder}
      />

      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {suggestions.map((suggestion, i) => {
            const meta = CATEGORY_META[suggestion.category];
            const Icon = meta.icon;
            const isActive = i === activeIndex;

            return (
              <div
                key={`${suggestion.category}:${suggestion.text}`}
                id={`ai-suggestion-${String(i)}`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => select(suggestion)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                    isActive && "bg-accent",
                  )}
                >
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    <HighlightedText text={suggestion.text} query={value} />
                  </span>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {meta.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
