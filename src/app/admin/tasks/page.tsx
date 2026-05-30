"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskForm } from "@/components/admin/task-form";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { createTask, updateTask, deleteTask } from "@/lib/actions/admin";
import { PROFILE_COLORS } from "@/lib/constants";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { Task, TaskType, TimeSlot, DayOfWeek } from "@/types";

export default function AdminTasksPage() {
  const { tasks, loading } = useTasks();
  const { profiles } = useProfiles();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  function handleEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleSubmit(data: {
    profileId: string;
    name: string;
    emoji: string;
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="gap-1"
          disabled={profiles.length === 0}
        >
          <Plus className="h-4 w-4" />
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
        <div className="space-y-3">
          {tasks.map((task) => {
            const profile = profileMap.get(task.profileId);
            const colors = profile ? PROFILE_COLORS[profile.color] : null;
            return (
              <Card key={task.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <span className="text-xl">{task.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{task.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {profile && colors && (
                        <span className={`text-xs font-medium ${colors.text}`}>
                          {profile.name}
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                      {task.timeSlot && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {task.timeSlot}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-star text-star" />
                    <span className="text-sm font-semibold">{task.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {profiles.length > 0 && (
        <TaskForm
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
