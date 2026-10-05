"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value?: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  label?: string;
  align?: "start" | "center" | "end";
  className?: string;
}

/**
 * Single-choice filter for table toolbars. The project has no native
 * `<select>` primitive, so this wraps the Base UI menu and keeps the same
 * keyboard/ARIA behaviour as the rest of the dashboard.
 */
export function FilterSelect({
  value = "",
  options,
  onChange,
  placeholder = "All",
  allLabel = "All",
  label,
  align = "start",
  className,
}: FilterSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-between gap-2 font-normal sm:w-auto border-red-600",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="max-h-72 w-56">
        <DropdownMenuGroup>
          {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
          <DropdownMenuItem
            onClick={() => onChange("")}
            className="cursor-pointer justify-between"
          >
            {allLabel}
            {!selected && <Check className="size-4 opacity-70" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="cursor-pointer justify-between"
            >
              <span className="truncate">{option.label}</span>
              {selected?.value === option.value && (
                <Check className="size-4 opacity-70" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
