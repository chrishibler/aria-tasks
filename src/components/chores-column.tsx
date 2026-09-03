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

interface ChoresColumnProps {
  profiles: Profile[];
}

export function ChoresColumn({ profiles }: ChoresColumnProps) {
  const { date, dateString } = useDateNavigation();
  const { tasks } = useTasks();
  const { completions } = useCompletions({ date: dateString });

  const dayOfWeek = getDayOfWeek(date);

  const completionMap = useMemo(() => {
    const map = new Map<string, Completion>();
    completions.forEach((c) => map.set(c.taskId, c));
    return map;
  }, [completions]);

  // All chores for the selected day, grouped by profile (in profile order).
  const choresByProfile = useMemo(() => {
    const activeChores = tasks.filter(
      (t) =>
        t.type === "chore" &&
        t.active !== false &&
        (t.repeatDays.length === 0 || t.repeatDays.includes(dayOfWeek))
    );
    return profiles
      .map((profile) => ({
        profile,
        chores: activeChores
          .filter((c) => c.profileId === profile.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.chores.length > 0);
  }, [tasks, profiles, dayOfWeek]);

  const totalChores = choresByProfile.reduce((sum, g) => sum + g.chores.length, 0);
  const doneChores = choresByProfile.reduce(
    (sum, g) => sum + g.chores.filter((c) => completionMap.has(c.id)).length,
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
          <h2 className="text-lg font-bold flex-1 truncate">Chores</h2>
        </div>
        <div className="flex items-center gap-1.5 text-base font-bold text-muted-foreground">
          {doneChores}/{totalChores} done
        </div>
      </div>

      {/* Chore cards grouped by profile */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 pt-4">
        {choresByProfile.map(({ profile, chores }) => {
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
                {chores.map((task) => (
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

        {totalChores === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No chores for today
          </p>
        )}
      </div>
    </div>
  );
}
