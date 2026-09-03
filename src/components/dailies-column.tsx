"use client";

import { useMemo } from "react";
import { Brush } from "lucide-react";
import { TaskCard } from "./task-row";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import { PROFILE_COLORS } from "@/lib/constants";
import { getDayOfWeek, cn } from "@/lib/utils";
import type { Profile, Completion } from "@/types";

interface DailiesColumnProps {
  profiles: Profile[];
}

export function DailiesColumn({ profiles }: DailiesColumnProps) {
  const { date, dateString } = useDateNavigation();
  const { tasks } = useTasks();
  const { completions } = useCompletions({ date: dateString });

  const dayOfWeek = getDayOfWeek(date);

  const completionMap = useMemo(() => {
    const map = new Map<string, Completion>();
    completions.forEach((c) => map.set(c.taskId, c));
    return map;
  }, [completions]);

  // All dailies for the selected day, grouped by profile (in profile order).
  const dailiesByProfile = useMemo(() => {
    const activeDailies = tasks.filter(
      (t) =>
        t.type === "daily" &&
        t.active !== false &&
        (t.repeatDays.length === 0 || t.repeatDays.includes(dayOfWeek))
    );
    return profiles
      .map((profile) => ({
        profile,
        dailies: activeDailies
          .filter((c) => c.profileId === profile.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.dailies.length > 0);
  }, [tasks, profiles, dayOfWeek]);

  const totalDailies = dailiesByProfile.reduce((sum, g) => sum + g.dailies.length, 0);
  const doneDailies = dailiesByProfile.reduce(
    (sum, g) => sum + g.dailies.filter((c) => completionMap.has(c.id)).length,
    0
  );

  return (
    <div className="m-2 flex w-[calc(100%-1rem)] flex-none snap-center snap-always flex-col rounded-2xl sm:w-auto sm:min-w-[300px] sm:max-w-[400px] sm:flex-1 bg-slate-100/70">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 rounded-t-2xl bg-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 ring-2 ring-white shadow-sm">
            <Brush className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold flex-1 truncate">Dailies</h2>
        </div>
        <div className="flex items-center gap-1.5 text-base font-bold text-muted-foreground">
          {doneDailies}/{totalDailies} done
        </div>
      </div>

      {/* Daily cards grouped by profile */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 pt-4">
        {dailiesByProfile.map(({ profile, dailies }) => {
          const colors = PROFILE_COLORS[profile.color];
          return (
            <div key={profile.id}>
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    colors.bg,
                    colors.text
                  )}
                >
                  {profile.avatarInitial}
                </div>
                <h3 className="text-sm font-bold text-foreground/70">{profile.name}</h3>
              </div>
              <div className="space-y-2">
                {dailies.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    completion={completionMap.get(task.id)}
                    profileColor={profile.color}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {totalDailies === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No dailies for today
          </p>
        )}
      </div>
    </div>
  );
}
