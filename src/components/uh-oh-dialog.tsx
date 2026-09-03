"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { UhOhCat } from "@/components/uh-oh-cat";
import { useStars } from "@/lib/hooks/use-stars";
import { addAdjustment } from "@/lib/actions/adjustments";
import { PROFILE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon, StarIcon } from "@heroicons/react/24/solid";
import type { Profile } from "@/types";

interface UhOhDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
}

/**
 * The situations this actually gets used for. Each names what happened rather
 * than labelling the child — the wording lands in the ledger and gets read
 * back later, so it stays neutral and specific.
 */
const REASONS = [
  "Didn't do what was asked",
  "Asked more than once",
  "Unkind to someone",
  "House rule broken",
];

/**
 * The take-away-only dialog behind the "Uh Oh" button. Deliberately narrower
 * than the admin adjustment form: no direction to choose, no way to give stars
 * from the family screen. Writes the same ledger entry, under the same guard.
 */
export function UhOhDialog({ open, onOpenChange, profiles }: UhOhDialogProps) {
  const [profileId, setProfileId] = useState(profiles.length === 1 ? profiles[0].id : "");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { balance } = useStars(profileId || undefined);
  const selected = profiles.find((p) => p.id === profileId);

  // Can't take more than they have — a balance never goes below zero.
  const capped = Math.min(amount, Math.max(balance, 1));
  const empty = !!selected && balance === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !reason.trim() || empty) return;

    setSaving(true);
    const result = await addAdjustment(profileId, -capped, reason);
    setSaving(false);

    if (result.ok) {
      onOpenChange(false);
      return;
    }
    setError(
      `${selected.name} now has only ${result.balance} ${
        result.balance === 1 ? "star" : "stars"
      } — someone may have spent them just now.`
    );
  }

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="sm:max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <UhOhCat className="size-12 shrink-0" />
          <div>
            <h2 className="font-heading text-lg leading-none font-semibold tracking-wider uppercase">
              Uh Oh
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Take stars back.
            </p>
          </div>
        </div>

        {profiles.length > 1 && (
          <div role="group" aria-label="Profile" className="flex flex-wrap gap-2">
            {profiles.map((profile) => (
              <ProfileChip
                key={profile.id}
                profile={profile}
                selected={profileId === profile.id}
                onSelect={() => {
                  setProfileId(profile.id);
                  setAmount(1);
                  setError(null);
                }}
              />
            ))}
          </div>
        )}

        {empty ? (
          <p className="bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {selected?.name} has no stars to take away.
          </p>
        ) : (
          <>
            <div>
              <Label className="mb-3 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                How many
              </Label>
              <div className="flex items-center gap-3">
                <StepperButton
                  label="One fewer star"
                  disabled={capped <= 1}
                  onPress={() => setAmount((a) => Math.max(1, a - 1))}
                >
                  <MinusIcon className="h-5 w-5" />
                </StepperButton>
                <input
                  type="number"
                  inputMode="numeric"
                  aria-label="Stars to take away"
                  min={1}
                  max={Math.max(balance, 1)}
                  value={capped}
                  onChange={(e) => {
                    const next = parseInt(e.target.value);
                    setAmount(
                      Number.isNaN(next)
                        ? 1
                        : Math.max(1, Math.min(next, Math.max(balance, 1)))
                    );
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
                  disabled={capped >= Math.max(balance, 1)}
                  onPress={() => setAmount((a) => Math.min(Math.max(balance, 1), a + 1))}
                >
                  <PlusIcon className="h-5 w-5" />
                </StepperButton>

                {selected && (
                  <p
                    aria-live="polite"
                    className="ml-auto flex items-baseline gap-1.5 text-right"
                  >
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {balance}
                    </span>
                    <span aria-hidden className="text-muted-foreground">
                      &rarr;
                    </span>
                    <span
                      key={balance - capped}
                      className="animate-count-up text-2xl font-bold tabular-nums"
                    >
                      {balance - capped}
                    </span>
                    <StarIcon className="h-4 w-4 self-center text-star" />
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="uhOhReason"
                className="mb-3 block text-xs font-semibold tracking-widest text-muted-foreground uppercase"
              >
                What happened
              </Label>
              <input
                id="uhOhReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="In your own words"
                required
                className="h-12 w-full border-b border-border bg-transparent text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {REASONS.map((preset) => (
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
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <DialogFooter>
          {/* Nothing to take away means there's no action to offer — just a way out. */}
          <Button type="button" variant="outline" onPress={() => onOpenChange(false)}>
            {empty ? "Close" : "Cancel"}
          </Button>
          {!empty && (
            <Button
              type="submit"
              isDisabled={!selected || !reason.trim() || saving}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {saving ? "Saving..." : `Take away ${capped}`}
            </Button>
          )}
        </DialogFooter>
      </form>
    </Dialog>
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
