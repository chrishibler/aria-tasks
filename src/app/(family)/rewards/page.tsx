"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RewardCard } from "@/components/reward-card";
import { useRewards } from "@/lib/hooks/use-rewards";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useStars } from "@/lib/hooks/use-stars";
import { PROFILE_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const { rewards, loading: rewardsLoading } = useRewards(true);
  const { profiles, loading: profilesLoading } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Select first profile by default once loaded
  const activeProfileId = selectedProfileId ?? profiles[0]?.id ?? null;
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const { balance } = useStars(activeProfileId ?? undefined);

  const loading = rewardsLoading || profilesLoading;

  // Filter rewards for this profile
  const profileRewards = rewards.filter(
    (r) => r.profileIds.length === 0 || (activeProfileId && r.profileIds.includes(activeProfileId))
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Profile selector */}
      {profiles.length > 1 && (
        <div className="mb-6 flex gap-2">
          {profiles.map((profile) => {
            const colors = PROFILE_COLORS[profile.color];
            const isActive = profile.id === activeProfileId;
            return (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? `${colors.bg} ${colors.text} ring-2 ring-offset-1`
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                style={isActive ? { "--tw-ring-color": colors.hex } as React.CSSProperties : undefined}
              >
                <span className="text-base">{profile.avatarInitial}</span>
                {profile.name}
              </button>
            );
          })}
        </div>
      )}

      {activeProfile && (
        <div className="mb-6 flex items-center gap-2 text-lg font-bold">
          <span className="text-star">★</span> {balance} stars
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : profileRewards.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No rewards yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ask a parent to add some rewards.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profileRewards.map((reward, i) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <RewardCard
                reward={reward}
                balance={balance}
                profileId={activeProfileId!}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
