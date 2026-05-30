"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar-view";
import { useCompletions } from "@/lib/hooks/use-completions";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useTasks } from "@/lib/hooks/use-tasks";
import { PROFILE_COLORS } from "@/lib/constants";
import { getDateString } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(getDateString(today));

  const { completions } = useCompletions({ todayOnly: false });
  const { profiles } = useProfiles();
  const { tasks } = useTasks();

  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  // Completions for selected date
  const dayCompletions = useMemo(
    () => completions.filter((c) => c.date === selectedDate),
    [completions, selectedDate]
  );

  // Group by profile
  const dayByProfile = useMemo(() => {
    const map = new Map<string, typeof dayCompletions>();
    for (const c of dayCompletions) {
      if (!map.has(c.profileId)) map.set(c.profileId, []);
      map.get(c.profileId)!.push(c);
    }
    return map;
  }, [dayCompletions]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold">{monthName}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <CalendarView
        year={year}
        month={month}
        completions={completions}
        profiles={profiles}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(getDateString(d))}
      />

      {/* Selected day detail */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-bold text-muted-foreground mb-3">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>

        {dayCompletions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completions on this day.</p>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => {
              const items = dayByProfile.get(profile.id);
              if (!items || items.length === 0) return null;
              const colors = PROFILE_COLORS[profile.color];
              return (
                <div key={profile.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-6 w-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-xs font-bold`}
                    >
                      {profile.avatarInitial}
                    </div>
                    <span className="text-sm font-semibold">{profile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {items.length} task{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="ml-8 space-y-1">
                    {items.map((c) => {
                      const task = taskMap.get(c.taskId);
                      return (
                        <li key={c.id} className="flex items-center gap-2 text-sm">
                          <span>{task?.emoji ?? "⭐"}</span>
                          <span>{task?.name ?? "Deleted task"}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            +{task?.stars ?? 0}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
