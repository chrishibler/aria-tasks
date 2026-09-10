"use client";

import { useEffect, useRef, useState } from "react";
import { StarIcon, CheckIcon } from "@heroicons/react/24/solid";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { redeemReward, undoRedemption } from "@/lib/actions/rewards";
import { useConfirm } from "@/components/confirm-provider";
import type { Reward } from "@/types";
import { cn } from "@/lib/utils";

/**
 * How long the "Undo" stays on the card after redeeming. Long enough to catch
 * a mis-tap, short enough that it can't be used to keep the reward and take
 * the stars back later — a parent undoes those from admin History instead.
 */
const UNDO_WINDOW_MS = 10_000;

interface RewardCardProps {
  reward: Reward;
  balance: number;
  profileId: string;
}

export function RewardCard({ reward, balance, profileId }: RewardCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  // The id of the redemption the undo below would reverse; null once the
  // window has closed.
  const [undoableId, setUndoableId] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirm = useConfirm();
  const canAfford = balance >= reward.starCost;
  const progress = Math.min((balance / reward.starCost) * 100, 100);

  // A redemption belongs to the profile that made it, so switching profiles
  // closes any open undo window instead of offering it to the next kid. The
  // same cleanup runs on unmount, so no timer is left to fire against a card
  // that is gone.
  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
      setUndoableId(null);
    },
    [profileId]
  );

  function closeUndoWindow() {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;
    setUndoableId(null);
  }

  async function handleRedeem() {
    setShowConfirm(false);
    // The server-side check is authoritative, so only celebrate once it passes.
    const result = await redeemReward(
      reward.id,
      reward.name,
      profileId,
      reward.starCost
    );

    if (!result.ok) {
      await confirm({
        title: "Not enough stars",
        description: `${reward.name} costs ${reward.starCost} stars and you have ${result.balance}. Earn ${result.shortfall} more and try again.`,
        confirmLabel: "OK",
        destructive: false,
        showCancel: false,
      });
      return;
    }

    setUndoableId(result.redemptionId);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      undoTimerRef.current = null;
      setUndoableId(null);
    }, UNDO_WINDOW_MS);
  }

  async function handleUndo() {
    if (!undoableId) return;
    const id = undoableId;
    // Close first so a second tap can't fire the same undo twice.
    closeUndoWindow();
    await undoRedemption(id);
  }

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card p-5 transition-all",
          undoableId ? "border-primary/50 bg-primary/5" : "border-border"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {reward.emoji && <span className="text-xl">{reward.emoji}</span>}
            <h3 className="text-base font-bold">{reward.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-star" />
            <span className="text-sm font-bold">{reward.starCost}</span>
          </div>
        </div>

        {reward.description && (
          <p className="mb-3 text-sm text-muted-foreground">{reward.description}</p>
        )}

        <div className="mb-3">
          <Progress value={progress} className="h-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {canAfford ? (
              <span className="flex items-center gap-1 text-primary font-medium">
                <CheckIcon className="h-3 w-3" />
                Ready to redeem
              </span>
            ) : (
              <>
                {Math.min(balance, reward.starCost)} of {reward.starCost} stars
              </>
            )}
          </p>
        </div>

        <Button
          onPress={() => setShowConfirm(true)}
          isDisabled={!canAfford}
          className={cn(
            "w-full rounded-lg text-sm font-semibold",
            canAfford ? "" : "opacity-50"
          )}
          size="sm"
        >
          {canAfford ? "Redeem" : `Need ${reward.starCost - balance} more`}
        </Button>

        {undoableId && (
          <div className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-primary animate-check-in">
            <span className="flex items-center gap-1">
              <CheckIcon className="h-4 w-4" />
              Redeemed!
            </span>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleUndo}
              className="h-auto gap-1 px-2 py-0.5 text-sm font-semibold underline"
            >
              <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
              Undo
            </Button>
          </div>
        )}
      </div>

      <Dialog isOpen={showConfirm} onOpenChange={setShowConfirm} className="rounded-xl">
        <DialogHeader>
          <DialogTitle>Redeem Reward?</DialogTitle>
          <DialogDescription>
            Spend <strong>{reward.starCost} stars</strong> to get{" "}
            <strong>{reward.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onPress={() => setShowConfirm(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button onPress={handleRedeem} className="rounded-lg font-semibold">
            Yes, redeem
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
