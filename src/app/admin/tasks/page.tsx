"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TaskForm } from "@/components/admin/task-form";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { createTask, updateTask, deleteTask } from "@/lib/actions/admin";
import { PROFILE_COLORS, illustrationSrc, TIME_SLOTS } from "@/lib/constants";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Task, TaskType, TimeSlot, DayOfWeek } from "@/types";

const SECTIONS: { key: string; label: string; match: (t: Task) => boolean }[] = [
  { key: "morning", label: TIME_SLOTS.morning.label, match: (t) => t.type === "routine" && t.timeSlot === "morning" },
  { key: "afternoon", label: TIME_SLOTS.afternoon.label, match: (t) => t.type === "routine" && t.timeSlot === "afternoon" },
  { key: "evening", label: TIME_SLOTS.evening.label, match: (t) => t.type === "routine" && t.timeSlot === "evening" },
  { key: "chore", label: "Chores", match: (t) => t.type === "chore" },
];

export default function AdminTasksPage() {
  const { tasks, loading } = useTasks();
  const { profiles } = useProfiles();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  function toggleSection(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleSubmit(data: {
    profileId: string;
    name: string;
    illustration: string;
    type: TaskType;
    timeSlot: TimeSlot | null;
    stars: number;
    repeatDays: DayOfWeek[];
    order: number;
  }) {
    if (editing) {
      await updateTask(editing.id, data);
    } else {
      await createTask(data);
    }
    setEditing(undefined);
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this task and all its completions?")) {
      await deleteTask(id);
    }
  }

  async function handleToggleActive(task: Task) {
    await updateTask(task.id, { active: task.active === false });
  }

  function renderTask(task: Task) {
    const profile = profileMap.get(task.profileId);
    const colors = profile ? PROFILE_COLORS[profile.color] : null;
    const isActive = task.active !== false;
    return (
      <Card key={task.id} className={isActive ? "" : "opacity-55"}>
        <CardContent className="flex items-center gap-3 py-3">
          <Image
            src={illustrationSrc(task.illustration)}
            alt={task.name}
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{task.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {profile && colors && (
                <span className={`text-xs font-medium ${colors.text}`}>
                  {profile.name}
                </span>
              )}
              {!isActive && (
                <span className="text-xs font-medium text-muted-foreground">Hidden</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="h-3.5 w-3.5 text-star" />
            <span className="text-sm font-semibold">{task.stars}</span>
          </div>
          {/* react-aria's Switch doesn't forward `title`, so the tooltip lives
              on a wrapper and the switch carries its own accessible name. */}
          <span title={isActive ? "Visible to kids" : "Hidden from kids"}>
            <Switch
              isSelected={isActive}
              onChange={() => handleToggleActive(task)}
              aria-label={isActive ? "Visible to kids" : "Hidden from kids"}
            />
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onPress={() => handleEdit(task)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onPress={() => handleDelete(task.id)}>
              <TrashIcon className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <Button
          onPress={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="gap-1"
          isDisabled={profiles.length === 0}
        >
          <PlusIcon className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {profiles.length === 0 && (
        <p className="text-gray-500 mb-4">Create a profile first before adding tasks.</p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet.</p>
      ) : (
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const sectionTasks = tasks.filter(section.match);
            if (sectionTasks.length === 0) return null;
            const isCollapsed = collapsed.has(section.key);
            return (
              <div key={section.key}>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="mb-2 flex w-full items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-700"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                  {section.label}
                  <span className="font-medium normal-case text-gray-400">
                    ({sectionTasks.length})
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-3">{sectionTasks.map(renderTask)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {profiles.length > 0 && (
        <TaskForm
          // Remount so the form re-seeds its state from `initial`, which is
          // only read on mount.
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(undefined);
          }}
          onSubmit={handleSubmit}
          initial={editing}
          profiles={profiles}
          nextOrder={tasks.length}
        />
      )}
    </div>
  );
}
