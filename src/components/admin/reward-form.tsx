"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PROFILE_COLORS } from "@/lib/constants";
import type { Reward, Profile } from "@/types";
import { cn } from "@/lib/utils";

interface RewardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description: string;
    emoji?: string;
    starCost: number;
    profileIds: string[];
    renewable: boolean;
    available: boolean;
  }) => void;
  initial?: Reward;
  profiles: Profile[];
}

export function RewardForm({ open, onOpenChange, onSubmit, initial, profiles }: RewardFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const [starCost, setStarCost] = useState(initial?.starCost ?? 50);
  const [profileIds, setProfileIds] = useState<string[]>(initial?.profileIds ?? []);
  const [renewable, setRenewable] = useState(initial?.renewable ?? true);
  const [available, setAvailable] = useState(initial?.available ?? true);

  function toggleProfile(id: string) {
    setProfileIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      description,
      emoji: emoji || undefined,
      starCost,
      profileIds,
      renewable,
      available,
    });
    if (!initial) {
      setName("");
      setDescription("");
      setEmoji("");
      setStarCost(50);
      setProfileIds([]);
      setRenewable(true);
      setAvailable(true);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Reward" : "New Reward"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="w-16">
              <Label htmlFor="rewardEmoji">Emoji</Label>
              <Input
                id="rewardEmoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="text-center text-xl"
                maxLength={2}
                placeholder="🎮"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="rewardName">Name</Label>
              <Input
                id="rewardName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="30 min iPad time"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div>
            <Label htmlFor="starCost">Star Cost</Label>
            <Input
              id="starCost"
              type="number"
              min={1}
              value={starCost}
              onChange={(e) => setStarCost(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Profile selection */}
          <div>
            <Label>Available to (leave empty for all)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profiles.map((profile) => {
                const colors = PROFILE_COLORS[profile.color];
                const selected = profileIds.includes(profile.id);
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => toggleProfile(profile.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                      selected
                        ? `${colors.bg} ${colors.text} ring-1`
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    style={selected ? { "--tw-ring-color": colors.hex } as React.CSSProperties : undefined}
                  >
                    {profile.avatarInitial} {profile.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={renewable} onCheckedChange={setRenewable} />
            <Label>Renewable (can redeem multiple times)</Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={available} onCheckedChange={setAvailable} />
            <Label>Available for redemption</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {initial ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
