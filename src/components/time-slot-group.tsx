"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { TaskCard } from "./task-row";
import { TIME_SLOTS } from "@/lib/constants";
import type { Task, Completion, TimeSlot, ProfileColor } from "@/types";

interface TimeSlotGroupProps {
  timeSlot: TimeSlot;
  tasks: Task[];
  completionMap: Map<string, Completion>;
  profileColor: ProfileColor;
}

export function TimeSlotGroup({ timeSlot, tasks, completionMap, profileColor }: TimeSlotGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  const doneCount = tasks.filter((t) => completionMap.has(t.id)).length;

  return (
    <div>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mb-2 flex w-full items-center gap-1.5 text-sm font-bold text-foreground/70 transition-colors hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
        {TIME_SLOTS[timeSlot].label}
        <span className="font-medium text-muted-foreground">
          {doneCount}/{tasks.length}
        </span>
      </button>
      {!collapsed && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              completion={completionMap.get(task.id)}
              profileColor={profileColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
