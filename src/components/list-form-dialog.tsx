"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { LIST_ICONS, DEFAULT_LIST_ICON, listIcon } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CustomList } from "@/types";

interface ListFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provided when renaming an existing list; omitted when creating one. */
  initial?: CustomList;
  onSubmit: (data: { name: string; icon: string }) => void | Promise<void>;
}

export function ListFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: ListFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(listIcon(initial?.icon));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), icon: icon.trim() || DEFAULT_LIST_ICON });
    if (!initial) {
      setName("");
      setIcon(DEFAULT_LIST_ICON);
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      className="gap-0 rounded-2xl p-0 shadow-xl ring-0 sm:max-w-md"
    >
      <form onSubmit={handleSubmit}>
        {/* Live preview: the chosen icon next to the name being typed */}
        <div className="flex items-center gap-4 border-b bg-muted/40 px-5 py-5">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-black/5"
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <label
              htmlFor="listName"
              className="mb-1 block text-xs font-semibold text-muted-foreground"
            >
              {initial ? "Rename list" : "New list"}
            </label>
            <Input
              id="listName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shopping"
              required
              autoFocus
              className="h-10 rounded-xl border border-border bg-white px-3 text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="px-5 py-5">
          <span className="mb-2 block text-sm font-bold">Icon</span>
          <div className="grid grid-cols-8 gap-1 rounded-2xl border border-border/70 bg-muted/40 p-2">
            {LIST_ICONS.map((emoji) => {
              const selected = emoji === icon;
              return (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`Use ${emoji} as the icon`}
                  aria-pressed={selected}
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-xl transition-all",
                    "hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    selected
                      ? "bg-white shadow-sm ring-2 ring-primary"
                      : "ring-1 ring-transparent"
                  )}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="listIconCustom" className="text-sm text-muted-foreground">
              Or type your own
            </label>
            <Input
              id="listIconCustom"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
              aria-label="Custom icon"
              className="h-9 w-14 rounded-xl border border-border bg-white text-center text-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t bg-muted/30 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            onPress={() => onOpenChange(false)}
            className="rounded-full text-sm normal-case tracking-normal"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isDisabled={!name.trim()}
            className="rounded-full px-6 text-sm normal-case tracking-normal"
          >
            {initial ? "Save changes" : "Create list"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
