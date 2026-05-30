"use client";

import { TASK_EMOJIS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto p-1">
      {TASK_EMOJIS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          title={label}
          onClick={() => onChange(emoji)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all hover:bg-muted",
            value === emoji && "bg-primary/10 ring-2 ring-primary"
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
