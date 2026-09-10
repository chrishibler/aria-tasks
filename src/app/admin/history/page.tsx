"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useRedemptions } from "@/lib/hooks/use-redemptions";
import { useAdjustments } from "@/lib/hooks/use-adjustments";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { AdjustmentsTable } from "@/components/admin/adjustments-table";
import { RedemptionsTable } from "@/components/admin/redemptions-table";
import { useConfirm } from "@/components/confirm-provider";
import { undoRedemption } from "@/lib/actions/rewards";
import { PROFILE_COLORS, illustrationSrc } from "@/lib/constants";
import Image from "next/image";
import type { Redemption } from "@/types";

export default function AdminHistoryPage() {
  const { completions } = useCompletions({ todayOnly: false });
  const { redemptions } = useRedemptions();
  const { adjustments } = useAdjustments();
  const { tasks } = useTasks();
  const { profiles } = useProfiles();
  const confirm = useConfirm();

  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const sortedCompletions = useMemo(
    () =>
      [...completions].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0);
      }),
    [completions]
  );

  async function handleUndoRedemption(redemption: Redemption) {
    const profile = profileMap.get(redemption.profileId);
    const confirmed = await confirm({
      title: `Undo redeeming "${redemption.rewardName}"?`,
      description: `${redemption.starCost} ${
        redemption.starCost === 1 ? "star" : "stars"
      } will be returned to ${
        profile?.name ?? "this profile"
      }. The redemption stays in History, marked as undone.`,
      confirmLabel: "Undo it",
      destructive: false,
    });
    if (!confirmed) return;

    await undoRedemption(redemption.id);
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">History</h2>

      <Tabs defaultSelectedKey="earned">
        <TabsList>
          <TabsTrigger id="earned">Stars Earned</TabsTrigger>
          <TabsTrigger id="redeemed">Rewards Redeemed</TabsTrigger>
          <TabsTrigger id="adjusted">Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent id="earned">
          {sortedCompletions.length === 0 ? (
            <p className="text-gray-500 mt-4">No completions yet.</p>
          ) : (
            <Table aria-label="Stars earned">
              {/* react-aria's TableHeader takes Columns directly — no Row wrapper. */}
              <TableHeader>
                <TableHead isRowHeader>Date</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="text-right">Stars</TableHead>
              </TableHeader>
              <TableBody>
                {sortedCompletions.map((c) => {
                  const task = taskMap.get(c.taskId);
                  const profile = profileMap.get(c.profileId);
                  const colors = profile ? PROFILE_COLORS[profile.color] : null;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm">{c.date}</TableCell>
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
                        {task ? (
                          <span className="flex items-center gap-2">
                            <Image
                              src={illustrationSrc(task.illustration)}
                              alt={task.name}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                            {task.name}
                          </span>
                        ) : (
                          "Deleted"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        +{task?.stars ?? 0}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent id="redeemed">
          {redemptions.length === 0 ? (
            <p className="text-gray-500 mt-4">No redemptions yet.</p>
          ) : (
            <RedemptionsTable
              redemptions={redemptions}
              profiles={profiles}
              onUndo={handleUndoRedemption}
            />
          )}
        </TabsContent>

        <TabsContent id="adjusted">
          {adjustments.length === 0 ? (
            <p className="text-gray-500 mt-4">No manual adjustments yet.</p>
          ) : (
            <AdjustmentsTable adjustments={adjustments} profiles={profiles} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
