"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useListItems } from "@/lib/hooks/use-list-items";
import { createListItem, updateListItem, deleteListItem } from "@/lib/actions/admin";
import type { CustomList } from "@/types";
import { cn } from "@/lib/utils";

interface ListCardProps {
  list: CustomList;
}

export function ListCard({ list }: ListCardProps) {
  const { items } = useListItems(list.id);
  const [expanded, setExpanded] = useState(true);
  const [newItemText, setNewItemText] = useState("");

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

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="rounded-xl border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-lg">{list.icon}</span>
        <span className="flex-1 font-semibold">{list.name}</span>
        <span className="text-xs text-muted-foreground">
          {checkedCount}/{items.length}
        </span>
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No items yet</p>
          ) : (
            <ul className="space-y-1 mb-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 py-1 group">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      handleToggleItem(item.id, checked === true)
                    }
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      item.checked && "line-through text-muted-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add item..."
              className="h-8 text-sm"
            />
            <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!newItemText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
