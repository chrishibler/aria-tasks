"use client";

import { useMemo, useState } from "react";
import { Star, Check, Sun, Cloud, Moon, Sparkles } from "lucide-react";
import { TimeSlotGroup } from "./time-slot-group";
import { TaskCard } from "./task-row";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useStars } from "@/lib/hooks/use-stars";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import { PROFILE_COLORS } from "@/lib/constants";
import { getDayOfWeek, cn } from "@/lib/utils";
import type { Profile, Task, Completion, TimeSlot } from "@/types";

const columnBgColors: Record<string, string> = {
  rose: "bg-rose-50/70",
  sky: "bg-sky-50/70",
  violet: "bg-violet-50/70",
  amber: "bg-amber-50/70",
  emerald: "bg-emerald-50/70",
  orange: "bg-orange-50/70",
  teal: "bg-teal-50/70",
  pink: "bg-pink-50/70",
};

const progressColors: Record<string, string> = {
  rose: "#f43f5e",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  emerald: "#10b981",
  orange: "#f97316",
  teal: "#14b8a6",
  pink: "#ec4899",
};

type FilterSlot = "all" | TimeSlot | "chores";

const filterIcons = [
  { slot: "morning" as const, Icon: Sun, label: "Morning" },
  { slot: "afternoon" as const, Icon: Cloud, label: "Afternoon" },
  { slot: "evening" as const, Icon: Moon, label: "Evening" },
  { slot: "chores" as const, Icon: Sparkles, label: "Chores" },
];

function CircularProgress({
  progress,
  color,
  size = 44,
  strokeWidth = 3,
  children,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/[0.06]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface ProfileColumnProps {
  profile: Profile;
}

export function ProfileColumn({ profile }: ProfileColumnProps) {
  const { date, dateString } = useDateNavigation();
  const { tasks } = useTasks(profile.id);
  const { completions } = useCompletions({ profileId: profile.id, date: dateString });
  const { balance } = useStars(profile.id);
  const [filter, setFilter] = useState<FilterSlot>("all");

  const colors = PROFILE_COLORS[profile.color];
  const dayOfWeek = getDayOfWeek(date);

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.repeatDays.length === 0 || t.repeatDays.includes(dayOfWeek)),
    [tasks, dayOfWeek]
  );

  const routines = useMemo(
    () => activeTasks.filter((t) => t.type === "routine"),
    [activeTasks]
  );
  const chores = useMemo(
    () => activeTasks.filter((t) => t.type === "chore"),
    [activeTasks]
  );

  const slotGroups = useMemo(() => {
    const groups: Record<TimeSlot, Task[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const task of routines) {
      const slot = task.timeSlot ?? "morning";
      groups[slot].push(task);
    }
    return groups;
  }, [routines]);

  const hasSlotTasks = useMemo(() => ({
    morning: slotGroups.morning.length > 0,
    afternoon: slotGroups.afternoon.length > 0,
    evening: slotGroups.evening.length > 0,
    chores: chores.length > 0,
  }), [slotGroups, chores]);

  const completionMap = useMemo(() => {
    const map = new Map<string, Completion>();
    completions.forEach((c) => map.set(c.taskId, c));
    return map;
  }, [completions]);

  // Per-slot completion progress
  const slotProgress = useMemo(() => {
    function calcProgress(taskList: Task[]) {
      if (taskList.length === 0) return 0;
      const done = taskList.filter((t) => completionMap.has(t.id)).length;
      return done / taskList.length;
    }
    return {
      morning: calcProgress(slotGroups.morning),
      afternoon: calcProgress(slotGroups.afternoon),
      evening: calcProgress(slotGroups.evening),
      chores: calcProgress(chores),
    };
  }, [slotGroups, chores, completionMap]);

  const completedCount = completions.length;
  const totalCount = activeTasks.length;

  const slots: TimeSlot[] = ["morning", "afternoon", "evening"];

  const showSlots = filter === "all" || (filter !== "chores");
  const showChores = filter === "all" || filter === "chores";
  const ringColor = progressColors[profile.color];

  return (
    <div className={cn("flex min-w-[300px] max-w-[400px] flex-1 flex-col", columnBgColors[profile.color])}>
      {/* Profile header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg} ${colors.text} text-lg font-bold ring-2 ring-white shadow-sm`}
          >
            {profile.avatarInitial}
          </div>
          <h2 className="text-lg font-bold flex-1 truncate">{profile.name}</h2>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Check className="h-3.5 w-3.5" />
            {completedCount}/{totalCount}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Star className="h-3.5 w-3.5 fill-star text-star" />
            {balance}
          </span>
        </div>

        {/* Time-of-day filter icons with circular progress */}
        <div className="flex gap-2">
          {filterIcons.map(({ slot, Icon, label }) => {
            if (!hasSlotTasks[slot]) return null;
            const isActive = filter === slot;
            return (
              <button
                key={slot}
                title={label}
                onClick={() => setFilter(isActive ? "all" : slot)}
                className="transition-all"
              >
                <CircularProgress
                  progress={slotProgress[slot]}
                  color={ringColor}
                >
                  <div
                    className={cn(
                      "flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors",
                      isActive
                        ? `${colors.bg} ${colors.text}`
                        : "bg-white/80 text-muted-foreground hover:bg-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </CircularProgress>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {showSlots &&
          slots.map((slot) => {
            if (filter !== "all" && filter !== slot) return null;
            return (
              <TimeSlotGroup
                key={slot}
                timeSlot={slot}
                tasks={slotGroups[slot]}
                completionMap={completionMap}
                profileColor={profile.color}
              />
            );
          })}

        {showChores && chores.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-foreground/70">Chores</h3>
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
        )}

        {activeTasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No tasks for today
          </p>
        )}
      </div>
    </div>
  );
}
