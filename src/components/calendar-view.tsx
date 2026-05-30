"use client";

import { useMemo } from "react";
import { cn, getDateString } from "@/lib/utils";
import { PROFILE_COLORS } from "@/lib/constants";
import type { Completion, Profile } from "@/types";

interface CalendarViewProps {
  year: number;
  month: number; // 0-indexed
  completions: Completion[];
  profiles: Profile[];
  onSelectDate?: (date: Date) => void;
  selectedDate?: string;
}

export function CalendarView({
  year,
  month,
  completions,
  profiles,
  onSelectDate,
  selectedDate,
}: CalendarViewProps) {
  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles]
  );

  // Group completions by date
  const completionsByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const c of completions) {
      if (!map.has(c.date)) map.set(c.date, new Set());
      map.get(c.date)!.add(c.profileId);
    }
    return map;
  }, [completions]);

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = Array(startDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const today = getDateString(new Date());
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            if (day === null) return <div key={di} className="p-1" />;

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const profileIds = completionsByDate.get(dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={di}
                onClick={() => onSelectDate?.(new Date(year, month, day))}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-sm transition-colors hover:bg-muted",
                  isToday && "font-bold",
                  isSelected && "bg-primary/10 ring-1 ring-primary"
                )}
              >
                <span className={cn(isToday && "text-primary")}>{day}</span>
                {/* Completion dots */}
                {profileIds && profileIds.size > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from(profileIds)
                      .slice(0, 4)
                      .map((pid) => {
                        const profile = profileMap.get(pid);
                        const hex = profile
                          ? PROFILE_COLORS[profile.color].hex
                          : "#999";
                        return (
                          <div
                            key={pid}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: hex }}
                          />
                        );
                      })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
