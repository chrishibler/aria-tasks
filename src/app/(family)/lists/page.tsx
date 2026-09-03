"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/list-card";
import { ListFormDialog } from "@/components/list-form-dialog";
import { useCustomLists } from "@/lib/hooks/use-custom-lists";
import { createCustomList } from "@/lib/actions/admin";

export default function ListsPage() {
  const { lists, loading } = useCustomLists();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lists</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Shared checklists for the whole family.
          </p>
        </div>
        <Button
          onPress={() => setShowCreate(true)}
          className="shrink-0 gap-1.5 rounded-full text-sm normal-case tracking-normal"
        >
          <PlusIcon className="h-4 w-4" />
          New list
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <span aria-hidden className="text-4xl">📝</span>
          <p className="mt-3 text-lg font-bold">No lists yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Make a shopping list, a packing list, or anything else.
          </p>
          <Button
            onPress={() => setShowCreate(true)}
            className="mt-4 gap-1.5 rounded-full text-sm normal-case tracking-normal"
          >
            <PlusIcon className="h-4 w-4" />
            New list
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
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
