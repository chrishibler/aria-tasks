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
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import type { Adjustment, Profile } from "@/types";

interface AdjustmentsTableProps {
  adjustments: Adjustment[];
  profiles: Profile[];
  /** Omit to render the ledger read-only (History). */
  onReverse?: (entry: Adjustment) => void;
}

export function AdjustmentsTable({
  adjustments,
  profiles,
  onReverse,
}: AdjustmentsTableProps) {
  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles]
  );

  // An entry that some later entry undoes. Neither side can be reversed again:
  // the pair already nets to zero, and stacking reversals of reversals makes
  // the ledger unreadable.
  const reversedIds = useMemo(
    () =>
      new Set(
        adjustments.map((a) => a.reversesId).filter((id): id is string => !!id)
      ),
    [adjustments]
  );

  return (
    <Table aria-label="Star adjustments">
      <TableHeader>
        <TableHead isRowHeader>Date</TableHead>
        <TableHead>Profile</TableHead>
        <TableHead>Reason</TableHead>
        <TableHead className="text-right">Stars</TableHead>
        {onReverse && <TableHead className="text-right">Undo</TableHead>}
      </TableHeader>
      <TableBody>
        {adjustments.map((a) => {
          const profile = profileMap.get(a.profileId);
          const colors = profile ? PROFILE_COLORS[profile.color] : null;
          const isReversal = !!a.reversesId;
          const wasReversed = reversedIds.has(a.id);
          return (
            <TableRow key={a.id}>
              <TableCell className="text-sm whitespace-nowrap">
                {a.createdAt?.toDate?.()?.toLocaleDateString() ?? "—"}
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
                  <span className={wasReversed ? "text-gray-400 line-through" : ""}>
                    {a.reason}
                  </span>
                  {wasReversed && <Badge variant="secondary">Reversed</Badge>}
                  {isReversal && <Badge variant="secondary">Undo</Badge>}
                </span>
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  a.stars < 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {a.stars > 0 ? `+${a.stars}` : a.stars}
              </TableCell>
              {onReverse && (
                <TableCell className="text-right">
                  {!wasReversed && !isReversal && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Reverse ${a.reason}`}
                      onPress={() => onReverse(a)}
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
