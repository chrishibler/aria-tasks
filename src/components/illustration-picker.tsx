"use client";

import Image from "next/image";
import { CheckIcon } from "@heroicons/react/24/solid";
import { TASK_ILLUSTRATIONS, illustrationSrc } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface IllustrationPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export function IllustrationPicker({ value, onChange }: IllustrationPickerProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/40 p-2">
      <div className="grid max-h-56 grid-cols-4 gap-1.5 sm:grid-cols-5 overflow-y-auto p-0.5">
        {TASK_ILLUSTRATIONS.map(({ name, label }) => {
          const isSelected = value === name;
          return (
            <button
              key={name}
              type="button"
              title={label}
              aria-pressed={isSelected}
              onClick={() => onChange(name)}
              className={cn(
                "group relative flex flex-col items-center gap-1 rounded-xl p-1 transition-all",
                "hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected && "bg-white shadow-sm"
              )}
            >
              <span
                className={cn(
                  "relative block overflow-hidden rounded-xl ring-2 transition-all",
                  "group-hover:-translate-y-0.5",
                  isSelected
                    ? "ring-primary"
                    : "ring-transparent group-hover:ring-border"
                )}
              >
                <Image
                  src={illustrationSrc(name)}
                  alt={label}
                  width={52}
                  height={52}
                  className="block"
                />
                {isSelected && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "line-clamp-1 text-[11px] leading-tight",
                  isSelected ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
