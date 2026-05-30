"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmojiPicker } from "@/components/emoji-picker";
import { DAYS_OF_WEEK, ALL_DAYS } from "@/lib/constants";
import type { Task, TaskType, TimeSlot, DayOfWeek, Profile } from "@/types";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    profileId: string;
    name: string;
    emoji: string;
    type: TaskType;
    timeSlot: TimeSlot | null;
    stars: number;
    repeatDays: DayOfWeek[];
    order: number;
  }) => void;
  initial?: Task;
  profiles: Profile[];
  nextOrder: number;
}

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  initial,
  profiles,
  nextOrder,
}: TaskFormProps) {
  const [profileId, setProfileId] = useState(initial?.profileId ?? profiles[0]?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "⭐");
  const [type, setType] = useState<TaskType>(initial?.type ?? "routine");
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">(initial?.timeSlot ?? "morning");
  const [stars, setStars] = useState(initial?.stars ?? 1);
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(initial?.repeatDays ?? ALL_DAYS);

  function toggleDay(day: DayOfWeek) {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      profileId,
      name,
      emoji,
      type,
      timeSlot: type === "routine" ? (timeSlot || "morning") : null,
      stars,
      repeatDays,
      order: initial?.order ?? nextOrder,
    });
    if (!initial) {
      setName("");
      setEmoji("⭐");
      setStars(1);
      setRepeatDays(ALL_DAYS);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile */}
          <div>
            <Label>Profile</Label>
            <Select value={profileId} onValueChange={(v) => v && setProfileId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.avatarInitial} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="taskName">Name</Label>
            <Input
              id="taskName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brush teeth"
              required
            />
          </div>

          {/* Emoji */}
          <div>
            <Label>Emoji</Label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>

          {/* Type */}
          <div>
            <Label>Type</Label>
            <div className="mt-1 flex gap-2">
              <Button
                type="button"
                variant={type === "routine" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("routine")}
              >
                Routine
              </Button>
              <Button
                type="button"
                variant={type === "chore" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("chore")}
              >
                Chore
              </Button>
            </div>
          </div>

          {/* Time Slot (only for routines) */}
          {type === "routine" && (
            <div>
              <Label>Time of Day</Label>
              <Select value={timeSlot || "morning"} onValueChange={(v) => v && setTimeSlot(v as TimeSlot)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stars */}
          <div>
            <Label htmlFor="stars">Stars</Label>
            <Input
              id="stars"
              type="number"
              min={1}
              max={50}
              value={stars}
              onChange={(e) => setStars(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Repeat Days */}
          <div>
            <Label>Repeat Days</Label>
            <div className="mt-1 flex gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "h-8 w-8 rounded-full text-xs font-semibold transition-colors",
                    repeatDays.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !profileId}>
              {initial ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
