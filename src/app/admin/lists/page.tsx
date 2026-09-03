"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListFormDialog } from "@/components/list-form-dialog";
import { useConfirm } from "@/components/confirm-provider";
import { listIcon } from "@/lib/constants";
import { useCustomLists } from "@/lib/hooks/use-custom-lists";
import { useListItems } from "@/lib/hooks/use-list-items";
import {
  createCustomList,
  updateCustomList,
  softDeleteCustomList,
  restoreCustomList,
  deleteCustomList,
} from "@/lib/actions/admin";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { CustomList } from "@/types";

function itemLabel(n: number) {
  return `${n} item${n === 1 ? "" : "s"}`;
}

function ListRow({ list, deleted }: { list: CustomList; deleted: boolean }) {
  const { items } = useListItems(list.id);
  const [showRename, setShowRename] = useState(false);
  const confirm = useConfirm();

  async function handlePermanentDelete() {
    if (
      await confirm({
        title: `Permanently delete "${list.name}"?`,
        description: `This deletes the list and its ${itemLabel(items.length)} for good. It cannot be undone or restored.`,
        confirmLabel: "Delete forever",
      })
    ) {
      await deleteCustomList(list.id);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl",
          deleted && "opacity-60"
        )}
      >
        {listIcon(list.icon)}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className={cn("truncate font-semibold", deleted && "text-muted-foreground")}>
          {list.name}
        </h3>
        <p className="text-xs text-muted-foreground">{itemLabel(items.length)}</p>
      </div>

      {deleted ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onPress={() => restoreCustomList(list.id)}
            className="gap-1.5 rounded-full text-xs normal-case tracking-normal"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Restore
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onPress={handlePermanentDelete}
            aria-label={`Permanently delete ${list.name}`}
            className="rounded-full"
          >
            <TrashIcon className="h-4 w-4 text-destructive" />
          </Button>
        </>
      ) : (
        <>
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
            onPress={() => softDeleteCustomList(list.id)}
            aria-label={`Delete ${list.name}`}
            className="rounded-full"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </>
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

export default function AdminListsPage() {
  const { lists, deletedLists, loading } = useCustomLists();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lists</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared checklists shown to everyone in the family view.
          </p>
        </div>
        <Button
          onPress={() => setShowCreate(true)}
          className="shrink-0 gap-1.5 rounded-full text-sm normal-case tracking-normal"
        >
          <PlusIcon className="h-4 w-4" />
          Add list
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl border bg-card">
            {lists.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No lists yet. Create one to get started.
              </p>
            ) : (
              <div className="divide-y">
                {lists.map((list) => (
                  <ListRow key={list.id} list={list} deleted={false} />
                ))}
              </div>
            )}
          </div>

          {deletedLists.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Deleted
                <span className="ml-1.5 font-medium text-muted-foreground">
                  ({deletedLists.length})
                </span>
              </h3>
              <p className="mb-3 mt-0.5 text-sm text-muted-foreground">
                Hidden from the family view. Restoring brings back the list and
                everything on it.
              </p>
              <div className="divide-y overflow-hidden rounded-2xl border border-dashed bg-muted/30">
                {deletedLists.map((list) => (
                  <ListRow key={list.id} list={list} deleted />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ListFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={createCustomList}
      />
    </div>
  );
}
