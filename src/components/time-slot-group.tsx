"use client";

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
  if (tasks.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-foreground/70">
        {TIME_SLOTS[timeSlot].label}
      </h3>
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
    </div>
  );
}
