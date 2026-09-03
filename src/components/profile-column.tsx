"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { Sunrise, Sun, MoonStar } from "lucide-react";
import { StarIcon, CheckIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { TimeSlotGroup } from "./time-slot-group";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useStars } from "@/lib/hooks/use-stars";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import { PROFILE_COLORS } from "@/lib/constants";
import { getDayOfWeek, cn } from "@/lib/utils";
import type { Profile, Task, Completion, TimeSlot } from "@/types";

const columnBgColors: Record<string, string> = {
  rose: "bg-rose-100/80",
  sky: "bg-sky-100/70",
  violet: "bg-violet-100/70",
  amber: "bg-amber-100/70",
  emerald: "bg-emerald-100/70",
  orange: "bg-orange-100/70",
  teal: "bg-teal-100/70",
  pink: "bg-pink-100/70",
};

const headerBgColors: Record<string, string> = {
  rose: "bg-rose-100",
  sky: "bg-sky-100",
  violet: "bg-violet-100",
  amber: "bg-amber-100",
  emerald: "bg-emerald-100",
  orange: "bg-orange-100",
  teal: "bg-teal-100",
  pink: "bg-pink-100",
};

const filterIconBgColors: Record<string, string> = {
  rose: "bg-rose-200/80 text-rose-700",
  sky: "bg-sky-200/80 text-sky-700",
  violet: "bg-violet-200/80 text-violet-700",
  amber: "bg-amber-200/80 text-amber-700",
  emerald: "bg-emerald-200/80 text-emerald-700",
  orange: "bg-orange-200/80 text-orange-700",
  teal: "bg-teal-200/80 text-teal-700",
  pink: "bg-pink-200/80 text-pink-700",
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

type FilterSlot = "all" | TimeSlot;

const filterItems = [
  { slot: "morning" as const, Icon: Sunrise, label: "Morning", iconClass: "text-orange-500" },
  { slot: "afternoon" as const, Icon: Sun, label: "Afternoon", iconClass: "text-amber-500" },
  { slot: "evening" as const, Icon: MoonStar, label: "Evening", iconClass: "text-indigo-400" },
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

// Star total pill that ticks up (and pops) when the balance changes.
function StarTotal({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const scale = useMotionValue(1);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;

    const counter = animate(from, value, {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1], // fast start, gentle settle
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    // Celebratory pop only when it goes up.
    if (value > from) {
      animate(scale, [1, 1.3, 1], { duration: 0.4, ease: "easeOut" });
    }

    return () => counter.stop();
  }, [value, scale]);

  return (
    <motion.div
      style={{ scale }}
      className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 py-1 pl-2 pr-3 shadow-md ring-1 ring-amber-300/50"
    >
      <span className="relative flex items-center justify-center">
        <StarIcon className="h-7 w-7 text-white drop-shadow-[0_1px_1px_rgba(180,120,0,0.5)]" />
        <SparklesIcon className="absolute -right-1 -top-1 h-3 w-3 text-yellow-100" />
      </span>
      <span className="text-2xl font-extrabold text-white tabular-nums drop-shadow-[0_1px_1px_rgba(180,120,0,0.4)]">
        {display}
      </span>
    </motion.div>
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
    () =>
      tasks.filter(
        (t) =>
          t.active !== false &&
          (t.repeatDays.length === 0 || t.repeatDays.includes(dayOfWeek))
      ),
    [tasks, dayOfWeek]
  );

  // Only routines live in the profile column now; chores have their own column.
  const routines = useMemo(
    () => activeTasks.filter((t) => t.type === "routine"),
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
  }), [slotGroups]);

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
    };
  }, [slotGroups, completionMap]);

  const completedCount = routines.filter((t) => completionMap.has(t.id)).length;
  const totalCount = routines.length;

  const slots: TimeSlot[] = ["morning", "afternoon", "evening"];

  const ringColor = progressColors[profile.color];

  return (
    <div className={cn("flex min-w-[300px] max-w-[400px] flex-1 flex-col rounded-2xl m-2", columnBgColors[profile.color])}>
      {/* Profile header */}
      <div className={cn("px-5 pt-5 pb-4", headerBgColors[profile.color], "rounded-t-2xl")}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg} ${colors.text} text-lg font-bold ring-2 ring-white shadow-sm`}
          >
            {profile.avatarInitial}
          </div>
          <h2 className="text-lg font-bold flex-1 truncate">{profile.name}</h2>
          <StarTotal value={balance} />
        </div>

        {/* Time-of-day filter icons with circular progress + daily total */}
        <div className="flex items-center gap-2">
          {filterItems.map(({ slot, Icon, label, iconClass }) => {
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
                        ? filterIconBgColors[profile.color]
                        : "bg-white/60 hover:bg-white/90"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", iconClass)} />
                  </div>
                </CircularProgress>
              </button>
            );
          })}
          <div className="ml-auto relative flex items-center gap-1.5 overflow-hidden rounded-full bg-white/70 px-3 py-1 text-base font-bold ring-1 ring-black/5">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ backgroundColor: `${ringColor}40` }}
              initial={false}
              animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="relative z-10 flex items-center gap-1.5 text-foreground/70">
              <CheckIcon className="h-5 w-5" />
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Task cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {slots.map((slot) => {
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

        {routines.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No routines for today
          </p>
        )}
      </div>
    </div>
  );
}
