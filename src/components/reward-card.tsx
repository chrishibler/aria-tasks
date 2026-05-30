"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { redeemReward } from "@/lib/actions/rewards";
import type { Reward } from "@/types";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  reward: Reward;
  balance: number;
  profileId: string;
}

export function RewardCard({ reward, balance, profileId }: RewardCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [justRedeemed, setJustRedeemed] = useState(false);
  const canAfford = balance >= reward.starCost;
  const progress = Math.min((balance / reward.starCost) * 100, 100);

  async function handleRedeem() {
    setShowConfirm(false);
    setJustRedeemed(true);
    await redeemReward(reward.id, reward.name, profileId, reward.starCost);
    setTimeout(() => setJustRedeemed(false), 2000);
  }

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-card p-5 transition-all",
          justRedeemed ? "border-primary/50 bg-primary/5" : "border-border"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {reward.emoji && <span className="text-xl">{reward.emoji}</span>}
            <h3 className="text-base font-bold">{reward.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-star text-star" />
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
                <Check className="h-3 w-3" />
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
          onClick={() => setShowConfirm(true)}
          disabled={!canAfford}
          className={cn(
            "w-full rounded-lg text-sm font-semibold",
            canAfford ? "" : "opacity-50"
          )}
          size="sm"
        >
          {canAfford ? "Redeem" : `Need ${reward.starCost - balance} more`}
        </Button>

        {justRedeemed && (
          <div className="mt-2 flex items-center justify-center gap-1 text-sm font-medium text-primary animate-check-in">
            <Check className="h-4 w-4" />
            Redeemed!
          </div>
        )}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Redeem Reward?</DialogTitle>
            <DialogDescription>
              Spend <strong>{reward.starCost} stars</strong> to get{" "}
              <strong>{reward.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleRedeem} className="rounded-lg font-semibold">
              Yes, redeem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
