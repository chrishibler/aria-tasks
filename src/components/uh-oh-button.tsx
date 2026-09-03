"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UhOhDialog } from "@/components/uh-oh-dialog";
import { UhOhCat } from "@/components/uh-oh-cat";
import { useProfiles } from "@/lib/hooks/use-profiles";

/**
 * The quick way to take stars back without going through admin. Opens a
 * take-away-only dialog — giving stars stays in admin. Every use lands in the
 * ledger with its reason, and the same guard applies: no balance below zero.
 */
export function UhOhButton() {
  const { profiles } = useProfiles();
  const [open, setOpen] = useState(false);
  // Remounts the form so it re-seeds from its props on each open.
  const [formKey, setFormKey] = useState(0);

  if (profiles.length === 0) return null;

  return (
    <>
      {/* react-aria's onPress rather than a plain onClick: a raw click bubbles
          on to the overlay that just mounted, which dismisses it again. */}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Uh oh — take away stars"
        onPress={() => {
          setFormKey((k) => k + 1);
          setOpen(true);
        }}
        className="h-10 gap-2 rounded-lg border border-rose-200 bg-rose-50 pr-3 pl-1.5 text-rose-700 hover:bg-rose-100"
      >
        <UhOhCat className="size-7" />
        <span className="hidden sm:inline">Uh Oh</span>
      </Button>

      <UhOhDialog
        key={formKey}
        open={open}
        onOpenChange={setOpen}
        profiles={profiles}
      />
    </>
  );
}
