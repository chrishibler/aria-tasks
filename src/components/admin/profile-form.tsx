"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PROFILE_COLORS } from "@/lib/constants";
import { getProfileInitial } from "@/lib/utils";
import type { Profile, ProfileColor } from "@/types";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    color: ProfileColor;
    avatarInitial: string;
    order: number;
  }) => void;
  initial?: Profile;
  nextOrder: number;
}

const colorOptions: ProfileColor[] = [
  "rose",
  "sky",
  "violet",
  "amber",
  "emerald",
  "orange",
  "teal",
  "pink",
];

export function ProfileForm({
  open,
  onOpenChange,
  onSubmit,
  initial,
  nextOrder,
}: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState<ProfileColor>(initial?.color ?? "sky");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      color,
      avatarInitial: getProfileInitial(name),
      order: initial?.order ?? nextOrder,
    });
    if (!initial) {
      setName("");
      setColor("sky");
    }
    onOpenChange(false);
  }

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="max-w-sm">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit Profile" : "New Profile"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="profileName">Name</Label>
          <Input
            id="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aria"
            required
          />
        </div>

        <div>
          <Label>Color</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {colorOptions.map((c) => {
              const colors = PROFILE_COLORS[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    colors.bg,
                    color === c ? "ring-2 ring-offset-2" : "hover:scale-110"
                  )}
                  style={color === c ? { "--tw-ring-color": colors.hex } as React.CSSProperties : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Preview */}
        {name && (
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${PROFILE_COLORS[color].bg} ${PROFILE_COLORS[color].text} text-lg font-bold`}
            >
              {getProfileInitial(name)}
            </div>
            <span className="font-semibold">{name}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isDisabled={!name.trim()}>
            {initial ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
