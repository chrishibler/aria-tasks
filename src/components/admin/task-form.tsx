"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { IllustrationPicker } from "@/components/illustration-picker";
import {
  DAYS_OF_WEEK,
  ALL_DAYS,
  DEFAULT_ILLUSTRATION,
  TASK_ILLUSTRATIONS,
  TIME_SLOTS,
  PROFILE_COLORS,
  illustrationSrc,
  illustrationBg,
} from "@/lib/constants";
import type { Task, TaskType, TimeSlot, DayOfWeek, Profile } from "@/types";
import { cn } from "@/lib/utils";
import { XMarkIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    profileId: string;
    name: string;
    illustration: string;
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

const WEEKDAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri"];
const WEEKEND: DayOfWeek[] = ["sat", "sun"];

const SLOT_DOT: Record<TimeSlot, string> = {
  morning: "bg-morning",
  afternoon: "bg-afternoon",
  evening: "bg-evening",
};

/** Soft, sentence-case section heading — the themed <Label> is uppercase. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-sm font-bold text-foreground">{children}</span>
  );
}

/** Pill button used by the segmented controls. */
function Segment({
  selected,
  onPress,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all",
        selected
          ? "bg-white text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
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
  const [illustration, setIllustration] = useState(initial?.illustration ?? DEFAULT_ILLUSTRATION);
  const [type, setType] = useState<TaskType>(initial?.type ?? "routine");
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">(initial?.timeSlot ?? "morning");
  const [stars, setStars] = useState(initial?.stars ?? 1);
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(initial?.repeatDays ?? ALL_DAYS);

  function toggleDay(day: DayOfWeek) {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleIllustrationChange(next: string) {
    const nextLabel = TASK_ILLUSTRATIONS.find((i) => i.name === next)?.label ?? "";
    const currentLabel = TASK_ILLUSTRATIONS.find((i) => i.name === illustration)?.label ?? "";
    // Pre-fill the name from the label when it's empty or still matches the
    // previously selected illustration's label (i.e. not customized).
    if (name.trim() === "" || name === currentLabel) {
      setName(nextLabel);
    }
    setIllustration(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      profileId,
      name,
      illustration,
      type,
      timeSlot: type === "routine" ? (timeSlot || "morning") : null,
      stars,
      repeatDays,
      order: initial?.order ?? nextOrder,
    });
    if (!initial) {
      setName("");
      setIllustration(DEFAULT_ILLUSTRATION);
      setStars(1);
      setRepeatDays(ALL_DAYS);
    }
    onOpenChange(false);
  }

  const daysLabel =
    repeatDays.length === 7
      ? "Every day"
      : repeatDays.length === 0
        ? "No days selected"
        : `${repeatDays.length} days a week`;

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      // The modal stays `block` so the inner wrapper owns the column layout:
      // DialogPrimitive uses [display:inherit], which would inherit `flex`
      // without inheriting flex-direction and lay the sections out in a row.
      className="block gap-0 overflow-hidden rounded-3xl p-0 shadow-xl ring-0 sm:max-w-lg"
    >
      <div className="flex max-h-[88vh] flex-col">
        {/* Header — the live preview doubles as feedback for the illustration picker */}
        <div
          className="flex items-center gap-4 px-6 py-5"
          style={{ backgroundColor: illustrationBg(illustration) }}
        >
          <Image
            key={illustration}
            src={illustrationSrc(illustration)}
            alt=""
            width={64}
            height={64}
            className="animate-check-in rounded-2xl shadow-sm ring-1 ring-black/5"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-[family-name:var(--font-nunito)] text-xl font-extrabold text-gray-900">
              {initial ? "Edit task" : "New task"}
            </h2>
            <p className="truncate text-sm text-gray-600">
              {name.trim() || "Give it a name and pick a picture"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Profile */}
            <div>
              <SectionLabel>Who is it for?</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {profiles.map((p) => {
                  const colors = PROFILE_COLORS[p.color];
                  const selected = profileId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfileId(p.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center gap-2 rounded-full border-2 py-1.5 pl-1.5 pr-4 transition-all",
                        selected
                          ? `${colors.border} bg-white shadow-sm`
                          : "border-transparent bg-muted hover:bg-muted/70"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          colors.bg,
                          colors.text
                        )}
                      >
                        {p.avatarInitial}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          selected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="taskName" className="mb-2 text-sm font-bold tracking-normal normal-case text-foreground">
                Name
              </Label>
              <Input
                id="taskName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Brush teeth"
                required
                className="h-11 rounded-xl border border-border bg-white px-3.5 text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            {/* Illustration */}
            <div>
              <SectionLabel>Picture</SectionLabel>
              <IllustrationPicker value={illustration} onChange={handleIllustrationChange} />
            </div>

            {/* Type */}
            <div>
              <SectionLabel>Type</SectionLabel>
              <div className="flex rounded-full bg-muted p-1">
                <Segment selected={type === "routine"} onPress={() => setType("routine")}>
                  Routine
                </Segment>
                <Segment selected={type === "daily"} onPress={() => setType("daily")}>
                  Daily
                </Segment>
              </div>
            </div>

            {/* Time of day — routines only */}
            {type === "routine" && (
              <div>
                <SectionLabel>Time of day</SectionLabel>
                <div className="flex rounded-full bg-muted p-1">
                  {(Object.keys(TIME_SLOTS) as TimeSlot[]).map((slot) => (
                    <Segment
                      key={slot}
                      selected={(timeSlot || "morning") === slot}
                      onPress={() => setTimeSlot(slot)}
                    >
                      <span className={cn("h-2 w-2 rounded-full", SLOT_DOT[slot])} />
                      {TIME_SLOTS[slot].label}
                    </Segment>
                  ))}
                </div>
              </div>
            )}

            {/* Repeat days */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <SectionLabel>Repeats</SectionLabel>
                <span className="text-xs font-medium text-muted-foreground">{daysLabel}</span>
              </div>
              <div className="flex gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const on = repeatDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={on}
                      aria-label={day.label}
                      className={cn(
                        "h-10 flex-1 rounded-xl text-sm font-bold transition-all",
                        on
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-1.5">
                {[
                  { label: "Every day", days: ALL_DAYS },
                  { label: "Weekdays", days: WEEKDAYS },
                  { label: "Weekend", days: WEEKEND },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setRepeatDays(preset.days)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stars */}
            <div>
              <SectionLabel>Stars earned</SectionLabel>
              <div className="flex w-fit items-center gap-1 rounded-full bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setStars((s) => Math.max(1, s - 1))}
                  aria-label="Fewer stars"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-white/70 disabled:opacity-40"
                  disabled={stars <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="flex min-w-[4.5rem] items-center justify-center gap-1.5 text-lg font-extrabold tabular-nums">
                  <StarIcon className="h-5 w-5 text-star" />
                  {stars}
                </span>
                <button
                  type="button"
                  onClick={() => setStars((s) => Math.min(50, s + 1))}
                  aria-label="More stars"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-white/70 disabled:opacity-40"
                  disabled={stars >= 50}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onPress={() => onOpenChange(false)}
              className="rounded-full normal-case tracking-normal text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={!name.trim() || !profileId}
              className="rounded-full px-7 normal-case tracking-normal text-sm"
            >
              {initial ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
