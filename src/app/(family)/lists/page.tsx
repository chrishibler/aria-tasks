"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ListCard } from "@/components/list-card";
import { useCustomLists } from "@/lib/hooks/use-custom-lists";
import { createCustomList } from "@/lib/actions/admin";

export default function ListsPage() {
  const { lists, loading } = useCustomLists();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📝");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createCustomList({ name: newName.trim(), icon: newIcon });
    setNewName("");
    setNewIcon("📝");
    setShowCreate(false);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Lists</h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1">
          <PlusIcon className="h-4 w-4" />
          New List
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : lists.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No lists yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a shopping list, to-do list, or anything else.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <Dialog isOpen={showCreate} onOpenChange={setShowCreate} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-16 text-center text-xl"
              maxLength={2}
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="List name"
              required
              className="flex-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onPress={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" isDisabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
