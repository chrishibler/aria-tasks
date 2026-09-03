"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RewardForm } from "@/components/admin/reward-form";
import { useConfirm } from "@/components/confirm-provider";
import { useRewards } from "@/lib/hooks/use-rewards";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { createReward, updateReward, deleteReward } from "@/lib/actions/admin";
import { PlusIcon, PencilIcon, TrashIcon, StarIcon } from "@heroicons/react/24/outline";
import type { Reward } from "@/types";

export default function AdminRewardsPage() {
  const { rewards, loading } = useRewards();
  const confirm = useConfirm();
  const { profiles } = useProfiles();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | undefined>();

  function handleEdit(reward: Reward) {
    setEditing(reward);
    setFormOpen(true);
  }

  async function handleSubmit(data: {
    name: string;
    description: string;
    emoji?: string;
    starCost: number;
    profileIds: string[];
    renewable: boolean;
    available: boolean;
  }) {
    if (editing) {
      await updateReward(editing.id, data);
    } else {
      await createReward(data);
    }
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (
      await confirm({
        title: "Delete this reward?",
        description:
          "It will no longer be available to redeem. Past redemptions are kept in History.",
        confirmLabel: "Delete reward",
      })
    ) {
      await deleteReward(id);
    }
  }

  async function handleToggleAvailable(reward: Reward) {
    await updateReward(reward.id, { available: !reward.available });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
        <Button onPress={() => { setEditing(undefined); setFormOpen(true); }} className="gap-1">
          <PlusIcon className="h-4 w-4" />
          Add Reward
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rewards.length === 0 ? (
        <p className="text-gray-500">No rewards yet. Create your first one!</p>
      ) : (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className={!reward.available ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-4 py-4">
                {reward.emoji && <span className="text-xl">{reward.emoji}</span>}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{reward.name}</h3>
                  {reward.description && (
                    <p className="text-sm text-gray-500">{reward.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <StarIcon className="h-3 w-3" />
                  {reward.starCost}
                </Badge>
                <span title="Available">
                  <Switch
                    isSelected={reward.available}
                    onChange={() => handleToggleAvailable(reward)}
                    aria-label="Available"
                  />
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onPress={() => handleEdit(reward)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onPress={() => handleDelete(reward.id)}>
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RewardForm
        // Remount so the form re-seeds its state from `initial`, which is
        // only read on mount.
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(undefined); }}
        onSubmit={handleSubmit}
        initial={editing}
        profiles={profiles}
      />
    </div>
  );
}
