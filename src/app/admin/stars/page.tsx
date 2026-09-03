"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdjustmentForm } from "@/components/admin/adjustment-form";
import { AdjustmentsTable } from "@/components/admin/adjustments-table";
import { useConfirm } from "@/components/confirm-provider";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useAdjustments } from "@/lib/hooks/use-adjustments";
import { useStars } from "@/lib/hooks/use-stars";
import { addAdjustment, reverseAdjustment } from "@/lib/actions/adjustments";
import { PROFILE_COLORS } from "@/lib/constants";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import type { Adjustment, Profile } from "@/types";

type Direction = "give" | "take";

export default function AdminStarsPage() {
  const { profiles } = useProfiles();
  const { adjustments, loading } = useAdjustments();
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [formProfileId, setFormProfileId] = useState<string | undefined>();
  const [formDirection, setFormDirection] = useState<Direction>("give");
  // Bumped on every open so the form remounts and re-seeds from the props
  // below, which it only reads on mount.
  const [formKey, setFormKey] = useState(0);

  function openForm(profileId?: string, direction: Direction = "give") {
    setFormProfileId(profileId);
    setFormDirection(direction);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  async function handleReverse(entry: Adjustment) {
    const profile = profiles.find((p) => p.id === entry.profileId);
    const gave = entry.stars > 0;
    const magnitude = Math.abs(entry.stars);

    const confirmed = await confirm({
      title: `Undo "${entry.reason}"?`,
      description: `${magnitude} ${magnitude === 1 ? "star" : "stars"} will be ${
        gave ? "taken back from" : "returned to"
      } ${profile?.name ?? "this profile"}. Both entries stay in the ledger.`,
      confirmLabel: "Undo it",
      destructive: false,
    });
    if (!confirmed) return;

    const result = await reverseAdjustment(entry);
    if (!result.ok) {
      await confirm({
        title: "Can't undo this one",
        description: `Taking back ${magnitude} ${
          magnitude === 1 ? "star" : "stars"
        } would put ${profile?.name ?? "this profile"} ${
          result.shortfall
        } below zero — they only have ${result.balance} left, the rest is already spent.`,
        confirmLabel: "OK",
        destructive: false,
        showCancel: false,
      });
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Stars</h2>
        <Button onPress={() => openForm()} className="gap-1">
          <PlusIcon className="h-4 w-4" />
          Adjust Stars
        </Button>
      </div>
      <p className="mb-6 text-sm text-gray-600">
        Give or take away stars by hand for anything the app can&apos;t see. Every
        adjustment is kept here with its reason, and nothing is ever edited away —
        an entry made by mistake is undone by reversing it.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {profiles.map((profile) => (
          <ProfileStarsCard
            key={profile.id}
            profile={profile}
            onAdjust={(direction) => openForm(profile.id, direction)}
          />
        ))}
      </div>

      <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-900">Ledger</h3>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : adjustments.length === 0 ? (
        <p className="text-gray-500">
          No adjustments yet — every star so far was earned or spent in the app.
        </p>
      ) : (
        <AdjustmentsTable
          adjustments={adjustments}
          profiles={profiles}
          onReverse={handleReverse}
        />
      )}

      <AdjustmentForm
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        profiles={profiles}
        initialProfileId={formProfileId}
        initialDirection={formDirection}
        onSubmit={addAdjustment}
      />
    </div>
  );
}

/**
 * Own component so each profile gets its own useStars subscription — the hook
 * aggregates across all profiles when it isn't given an id.
 */
function ProfileStarsCard({
  profile,
  onAdjust,
}: {
  profile: Profile;
  onAdjust: (direction: Direction) => void;
}) {
  const { earned, spent, adjusted, balance } = useStars(profile.id);
  const colors = PROFILE_COLORS[profile.color];

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold`}
          >
            {profile.avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">{profile.name}</p>
            <p className="text-2xl font-bold">{balance} ⭐</p>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          {earned} earned
          {adjusted !== 0 && ` ${adjusted > 0 ? "+" : "−"} ${Math.abs(adjusted)} adjusted`}
          {" − "}
          {spent} spent
        </p>

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onPress={() => onAdjust("give")}>
            <PlusIcon className="h-4 w-4" />
            Give
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            isDisabled={balance === 0}
            onPress={() => onAdjust("take")}
          >
            <MinusIcon className="h-4 w-4" />
            Take away
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
