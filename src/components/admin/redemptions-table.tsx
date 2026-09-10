"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PROFILE_COLORS } from "@/lib/constants";
import { isRedemptionActive } from "@/lib/redemptions";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import type { Profile, Redemption } from "@/types";

interface RedemptionsTableProps {
  redemptions: Redemption[];
  profiles: Profile[];
  /** Omit to render the list read-only. */
  onUndo?: (redemption: Redemption) => void;
}

export function RedemptionsTable({
  redemptions,
  profiles,
  onUndo,
}: RedemptionsTableProps) {
  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles]
  );

  return (
    <Table aria-label="Rewards redeemed">
      <TableHeader>
        <TableHead isRowHeader>Date</TableHead>
        <TableHead>Profile</TableHead>
        <TableHead>Reward</TableHead>
        <TableHead className="text-right">Stars Spent</TableHead>
        {onUndo && <TableHead className="text-right">Undo</TableHead>}
      </TableHeader>
      <TableBody>
        {redemptions.map((r) => {
          const profile = profileMap.get(r.profileId);
          const colors = profile ? PROFILE_COLORS[profile.color] : null;
          const active = isRedemptionActive(r);
          return (
            <TableRow key={r.id}>
              <TableCell className="text-sm whitespace-nowrap">
                {r.redeemedAt?.toDate?.()?.toLocaleDateString() ?? "—"}
              </TableCell>
              <TableCell>
                {profile ? (
                  <span className={`text-sm font-medium ${colors?.text}`}>
                    {profile.name}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <span className="flex flex-wrap items-center gap-2">
                  <span className={active ? "" : "text-gray-400 line-through"}>
                    {r.rewardName}
                  </span>
                  {!active && <Badge variant="secondary">Undone</Badge>}
                </span>
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  active ? "" : "text-gray-400 line-through"
                }`}
              >
                -{r.starCost}
              </TableCell>
              {onUndo && (
                <TableCell className="text-right">
                  {active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Undo redeeming ${r.rewardName}`}
                      onPress={() => onUndo(r)}
                    >
                      <ArrowUturnLeftIcon className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
