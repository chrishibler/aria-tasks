"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ListFormDialog } from "@/components/list-form-dialog";
import { useListItems } from "@/lib/hooks/use-list-items";
import { useConfirm } from "@/components/confirm-provider";
import {
  createListItem,
  updateListItem,
  deleteListItem,
  updateCustomList,
  softDeleteCustomList,
} from "@/lib/actions/admin";
import { listIcon } from "@/lib/constants";
import type { CustomList } from "@/types";
import { cn } from "@/lib/utils";

interface ListCardProps {
  list: CustomList;
}

export function ListCard({ list }: ListCardProps) {
  const { items } = useListItems(list.id);
  const confirm = useConfirm();
  const [expanded, setExpanded] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [showRename, setShowRename] = useState(false);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;
    await createListItem({
      listId: list.id,
      text: newItemText.trim(),
      order: items.length,
    });
    setNewItemText("");
  }

  async function handleToggleItem(itemId: string, checked: boolean) {
    await updateListItem(itemId, { checked });
  }

  async function handleDeleteItem(itemId: string) {
    await deleteListItem(itemId);
  }

  async function handleSoftDelete() {
    if (
      await confirm({
        title: `Delete "${list.name}"?`,
        description:
          "Its items are kept, and a parent can restore it from Admin › Lists.",
        confirmLabel: "Delete list",
      })
    ) {
      await softDeleteCustomList(list.id);
    }
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const progress = items.length ? (checkedCount / items.length) * 100 : 0;
  const allDone = items.length > 0 && checkedCount === items.length;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Header: the title area toggles; rename/delete sit outside that button
          so they aren't nested inside another interactive element. */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
            {listIcon(list.icon)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{list.name}</span>
            <span className="text-xs text-muted-foreground">
              {items.length === 0
                ? "No items yet"
                : allDone
                  ? "All done 🎉"
                  : `${checkedCount} of ${items.length} done`}
            </span>
          </span>
          {expanded ? (
            <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onPress={() => setShowRename(true)}
          aria-label={`Rename ${list.name}`}
          className="rounded-full"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onPress={handleSoftDelete}
          aria-label={`Delete ${list.name}`}
          className="rounded-full"
        >
          <TrashIcon className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {items.length > 0 && (
        <div className="h-1 w-full bg-muted" role="presentation">
          <div
            className={cn(
              "h-full rounded-r-full transition-[width] duration-300",
              allDone ? "bg-emerald-400" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {expanded && (
        <div className="px-3 pb-3 pt-2">
          {items.length === 0 ? (
            <p className="px-1 py-3 text-sm text-muted-foreground">
              Nothing here yet — add the first item below.
            </p>
          ) : (
            <ul className="mb-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl px-1 py-1">
                  {/* Label wraps the checkbox so the whole row is one big
                      target — easier to hit than a 16px box on a tablet. */}
                  <Checkbox
                    isSelected={item.checked}
                    onChange={(checked) => handleToggleItem(item.id, checked)}
                    aria-label={item.text}
                    className="size-6 shrink-0 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id, !item.checked)}
                    className={cn(
                      "min-w-0 flex-1 py-2 text-left text-base transition-colors",
                      item.checked && "text-muted-foreground line-through"
                    )}
                  >
                    {item.text}
                  </button>
                  {/* Always visible: a hover-only control is unreachable on touch. */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-full text-muted-foreground"
                    onPress={() => handleDeleteItem(item.id)}
                    aria-label={`Remove ${item.text}`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add an item"
              aria-label={`Add an item to ${list.name}`}
              className="h-11 rounded-xl border border-border bg-background px-3 text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Add item"
              className="h-11 w-11 shrink-0 rounded-xl"
              isDisabled={!newItemText.trim()}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}

      {showRename && (
        <ListFormDialog
          open={showRename}
          onOpenChange={setShowRename}
          initial={list}
          onSubmit={(data) => updateCustomList(list.id, data)}
        />
      )}
    </div>
  );
}
