"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TaskForm } from "@/components/admin/task-form";
import { useConfirm } from "@/components/confirm-provider";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { createTask, updateTask, deleteTask } from "@/lib/actions/admin";
import { PROFILE_COLORS, illustrationSrc, illustrationBg, TIME_SLOTS } from "@/lib/constants";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import type { Task, TaskType, TimeSlot, DayOfWeek } from "@/types";

const SECTIONS: { key: string; label: string; match: (t: Task) => boolean }[] = [
  { key: "morning", label: TIME_SLOTS.morning.label, match: (t) => t.type === "routine" && t.timeSlot === "morning" },
  { key: "afternoon", label: TIME_SLOTS.afternoon.label, match: (t) => t.type === "routine" && t.timeSlot === "afternoon" },
  { key: "evening", label: TIME_SLOTS.evening.label, match: (t) => t.type === "routine" && t.timeSlot === "evening" },
  { key: "daily", label: "Dailies", match: (t) => t.type === "daily" },
];

export default function AdminTasksPage() {
  const { tasks, loading } = useTasks();
  const confirm = useConfirm();
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
    if (
      await confirm({
        title: "Delete this task?",
        description:
          "Its completed history will be deleted too, so any stars earned from it are removed. This cannot be undone.",
        confirmLabel: "Delete task",
      })
    ) {
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
      <div key={task.id} className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3", !isActive && "opacity-60")}>
        <Image
          src={illustrationSrc(task.illustration)}
          alt=""
          width={44}
          height={44}
          className="shrink-0 rounded-xl ring-1 ring-black/5"
          style={{ backgroundColor: illustrationBg(task.illustration) }}
        />

        {/* min-w-0 + truncate: the name gets whatever space is left and ellipses
            rather than wrapping into a two-character column. */}
        <div className="min-w-0 flex-1 basis-40">
          <h3 className="truncate font-semibold">{task.name}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            {profile && colors && (
              <span className={cn("font-medium", colors.text)}>{profile.name}</span>
            )}
            <span className="flex items-center gap-0.5 font-medium text-muted-foreground">
              <StarIcon className="h-3.5 w-3.5 text-star" />
              {task.stars}
            </span>
            {!isActive && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
                Hidden
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
        {/* react-aria's Switch doesn't forward `title`, so the tooltip lives
            on a wrapper and the switch carries its own accessible name. */}
        <span title={isActive ? "Visible to kids" : "Hidden from kids"} className="shrink-0 mr-1">
          <Switch
            isSelected={isActive}
            onChange={() => handleToggleActive(task)}
            aria-label={isActive ? "Visible to kids" : "Hidden from kids"}
          />
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onPress={() => handleEdit(task)}
          aria-label={`Edit ${task.name}`}
          className="rounded-full"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onPress={() => handleDelete(task.id)}
          aria-label={`Delete ${task.name}`}
          className="rounded-full"
        >
          <TrashIcon className="h-4 w-4 text-destructive" />
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Routines and dailies, grouped by when they appear in the family view.
          </p>
        </div>
        <Button
          onPress={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="shrink-0 gap-1.5 rounded-full text-sm normal-case tracking-normal"
          isDisabled={profiles.length === 0}
        >
          <PlusIcon className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {profiles.length === 0 && (
        <p className="mb-4 text-muted-foreground">
          Create a profile first before adding tasks.
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          No tasks yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const sectionTasks = tasks.filter(section.match);
            if (sectionTasks.length === 0) return null;
            const isCollapsed = collapsed.has(section.key);
            return (
              <section key={section.key}>
                <button
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={!isCollapsed}
                  className="mb-2 flex w-full items-center gap-1.5 text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                  {section.label}
                  <span className="font-medium text-muted-foreground">
                    {sectionTasks.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="divide-y overflow-hidden rounded-2xl border bg-card">
                    {sectionTasks.map(renderTask)}
                  </div>
                )}
              </section>
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
