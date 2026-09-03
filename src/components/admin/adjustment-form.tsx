"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useStars } from "@/lib/hooks/use-stars";
import { PROFILE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon, StarIcon } from "@heroicons/react/24/solid";
import type { AdjustResult } from "@/lib/actions/adjustments";
import type { Profile } from "@/types";

type Direction = "give" | "take";

interface AdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  /**
   * Pre-selects a profile when opened from that profile's card. Read on mount
   * only — the page remounts this form by key each time it opens.
   */
  initialProfileId?: string;
  initialDirection?: Direction;
  onSubmit: (profileId: string, stars: number, reason: string) => Promise<AdjustResult>;
}

/** Reasons a parent reaches for often enough to be worth one tap. */
const GIVE_PRESETS = ["Helped without being asked", "Did a daily off the app", "Refund"];
const TAKE_PRESETS = ["Undone by parent", "Correcting a mistake"];

const QUICK_AMOUNTS = [1, 5, 10];
const MAX_GIVE = 999;

export function AdjustmentForm({
  open,
  onOpenChange,
  profiles,
  initialProfileId,
  initialDirection = "give",
  onSubmit,
}: AdjustmentFormProps) {
  // With one child in the family there's nothing to choose — skip the step.
  const onlyProfileId = profiles.length === 1 ? profiles[0].id : undefined;
  const [profileId, setProfileId] = useState(initialProfileId ?? onlyProfileId ?? "");
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { balance } = useStars(profileId || undefined);
  const selected = profiles.find((p) => p.id === profileId);

  // A take-away can't reach below zero, so cap it at what's actually there
  // rather than letting a parent compose a number the write will refuse.
  const max = direction === "take" ? balance : MAX_GIVE;
  const capped = Math.min(amount, Math.max(max, 1));
  // Only ever blocks the take-away side: a profile at zero can still be given stars.
  const nothingToTake = !!selected && balance === 0;
  const blocked = direction === "take" && nothingToTake;
  const signed = direction === "give" ? capped : -capped;
  const projected = balance + signed;

  function setDirectionSafely(next: Direction) {
    setDirection(next);
    setError(null);
    if (next === "take") setAmount((a) => Math.min(a, Math.max(balance, 1)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId || !reason.trim() || capped < 1 || blocked) return;

    setSaving(true);
    const result = await onSubmit(profileId, signed, reason);
    setSaving(false);

    if (result.ok) {
      onOpenChange(false);
      return;
    }
    // The cap normally prevents this; it still fires if another device spent
    // the stars while this dialog was open.
    setError(
      `${selected?.name ?? "This profile"} now has only ${result.balance} ${
        result.balance === 1 ? "star" : "stars"
      } — someone may have spent them just now.`
    );
  }

  const canSubmit = !!profileId && !!reason.trim() && capped >= 1 && !blocked && !saving;

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Adjust Stars</DialogTitle>
        <DialogDescription>
          Recorded in the ledger with its reason. Nothing is edited away — a
          mistake is undone by reversing it.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Profile — hidden entirely when there's only one to pick */}
        {profiles.length > 1 && (
          <fieldset>
            <Legend>Who</Legend>
            <div role="group" aria-label="Profile" className="flex flex-wrap gap-2">
              {profiles.map((profile) => (
                <ProfileChip
                  key={profile.id}
                  profile={profile}
                  selected={profileId === profile.id}
                  onSelect={() => {
                    setProfileId(profile.id);
                    setError(null);
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Direction — a two-option segmented control, sign-coloured */}
        <fieldset>
          <Legend>Direction</Legend>
          <div role="group" aria-label="Direction" className="grid grid-cols-2 gap-2">
            {(["give", "take"] as const).map((d) => {
              const isSelected = direction === d;
              const disabled = d === "take" && nothingToTake;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={disabled}
                  onClick={() => setDirectionSafely(d)}
                  className={cn(
                    "touch-target flex items-center justify-center gap-2 border text-sm font-semibold tracking-wider uppercase transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
                    disabled && "cursor-not-allowed opacity-40",
                    isSelected && d === "give" && "border-emerald-500 bg-emerald-50 text-emerald-700",
                    isSelected && d === "take" && "border-rose-500 bg-rose-50 text-rose-700",
                    !isSelected && "border-border bg-transparent text-muted-foreground hover:bg-muted"
                  )}
                >
                  {d === "give" ? (
                    <PlusIcon className="h-4 w-4" />
                  ) : (
                    <MinusIcon className="h-4 w-4" />
                  )}
                  {d === "give" ? "Give" : "Take away"}
                </button>
              );
            })}
          </div>
          {nothingToTake && (
            <p className="mt-2 text-xs text-muted-foreground">
              {selected?.name} has no stars to take away yet.
            </p>
          )}
        </fieldset>

        {/* Amount — stepper first, typing second: this runs on a tablet */}
        <fieldset>
          <Legend>How many</Legend>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            <StepperButton
              label="One fewer star"
              onPress={() => setAmount((a) => Math.max(1, a - 1))}
              disabled={capped <= 1}
            >
              <MinusIcon className="h-5 w-5" />
            </StepperButton>

            <input
              type="number"
              inputMode="numeric"
              aria-label="Stars"
              min={1}
              max={Math.max(max, 1)}
              value={capped}
              onChange={(e) => {
                const next = parseInt(e.target.value);
                setAmount(Number.isNaN(next) ? 1 : Math.max(1, Math.min(next, Math.max(max, 1))));
                setError(null);
              }}
              className={cn(
                "h-12 w-20 border border-border bg-transparent text-center text-2xl font-bold tabular-nums",
                "focus-visible:border-ring focus-visible:outline-none",
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              )}
            />

            <StepperButton
              label="One more star"
              onPress={() => setAmount((a) => Math.min(Math.max(max, 1), a + 1))}
              disabled={capped >= Math.max(max, 1)}
            >
              <PlusIcon className="h-5 w-5" />
            </StepperButton>

            <div className="flex gap-1.5 sm:ml-auto">
              {QUICK_AMOUNTS.filter((n) => n <= Math.max(max, 1)).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setAmount(n);
                    setError(null);
                  }}
                  aria-pressed={capped === n}
                  className={cn(
                    "h-9 w-10 border text-sm font-semibold tabular-nums transition-colors",
                    capped === n
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Reason — required, because a ledger line without one explains nothing */}
        <fieldset>
          <Legend htmlFor="adjustReason">Reason</Legend>
          <input
            id="adjustReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are these stars moving?"
            required
            aria-describedby="adjustReasonHint"
            className="h-12 w-full border-b border-border bg-transparent text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none"
          />
          <p id="adjustReasonHint" className="mt-2 text-xs text-muted-foreground">
            {reason.trim()
              ? "This is what the ledger will show."
              : "Required — the ledger line has to explain itself later."}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(direction === "give" ? GIVE_PRESETS : TAKE_PRESETS).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReason(preset)}
                aria-pressed={reason === preset}
                className={cn(
                  "border px-3 py-1.5 text-xs transition-colors",
                  reason === preset
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Outcome — the whole point of the dialog, so it gets the weight.
            While the take-away side is blocked there is no honest projection to
            show, so the strip explains itself instead of printing a negative. */}
        {selected && blocked && (
          <p className="border-l-4 border-l-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {selected.name} has no stars to take away. Give stars instead, or
            un-check a task in the family view.
          </p>
        )}
        {selected && !blocked && (
          <div
            aria-live="polite"
            className={cn(
              "flex items-center justify-between border-l-4 bg-muted/50 px-4 py-3",
              direction === "give" ? "border-l-emerald-500" : "border-l-rose-500"
            )}
          >
            <div className="min-w-0">
              <p className="text-xs tracking-wider text-muted-foreground uppercase">
                {selected.name} will have
              </p>
              <p className="flex items-baseline gap-2">
                <span className="text-xl text-muted-foreground tabular-nums">{balance}</span>
                <span aria-hidden className="text-muted-foreground">&rarr;</span>
                <span
                  key={projected}
                  className="animate-count-up text-3xl font-bold tabular-nums"
                >
                  {projected}
                </span>
                <StarIcon className="h-6 w-6 self-center text-star" />
              </p>
            </div>
            <span
              className={cn(
                "px-2.5 py-1 text-sm font-bold tabular-nums",
                direction === "give"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              )}
            >
              {signed > 0 ? `+${signed}` : signed}
            </span>
          </div>
        )}

        {error && (
          <p role="alert" className="bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isDisabled={!canSubmit}>
            {saving
              ? "Saving..."
              : direction === "give"
                ? `Give ${capped} ${capped === 1 ? "star" : "stars"}`
                : `Take away ${capped}`}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function Legend({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="mb-3 block text-xs font-semibold tracking-widest text-muted-foreground uppercase"
    >
      {children}
    </Label>
  );
}

function StepperButton({
  children,
  label,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className={cn(
        "touch-target flex items-center justify-center border border-border transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        disabled ? "cursor-not-allowed opacity-30" : "hover:bg-muted active:translate-y-px"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Each chip shows that profile's live balance, so the choice is made with the
 * number in view rather than from memory.
 */
function ProfileChip({
  profile,
  selected,
  onSelect,
}: {
  profile: Profile;
  selected: boolean;
  onSelect: () => void;
}) {
  const { balance } = useStars(profile.id);
  const colors = PROFILE_COLORS[profile.color];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "touch-target flex items-center gap-2 border px-3 text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        selected ? "border-foreground" : "border-border hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
          colors.bg,
          colors.text
        )}
      >
        {profile.avatarInitial}
      </span>
      <span>{profile.name}</span>
      <span className="flex items-center gap-0.5 text-muted-foreground tabular-nums">
        {balance}
        <StarIcon className="h-3.5 w-3.5 text-star" />
      </span>
    </button>
  );
}
