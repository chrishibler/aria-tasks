"use client";

import { useSyncExternalStore } from "react";
import { getCurrentTimeSlot } from "../utils";
import type { TimeSlot } from "@/types";

export interface TimeSlotTick {
  slot: TimeSlot;
  /**
   * Counts slot changes since load. Callers key "the user chose this" against
   * it: a slot *name* recurs (evening again tomorrow, or after a timezone or
   * DST shift) and would revive a stale choice, but this only goes up.
   */
  generation: number;
}

// The clock is an external store: one poller shared by every subscriber, so a
// screen with several profile columns doesn't run a timer each.
const listeners = new Set<() => void>();
let cached: TimeSlotTick | null = null;
let generation = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function poll() {
  const next = getCurrentTimeSlot();
  if (!cached || next !== cached.slot) {
    generation += 1;
    cached = { slot: next, generation };
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    cached ??= { slot: getCurrentTimeSlot(), generation };
    // A minute is fine — this only has to notice a boundary, not the second it
    // happens. Polling rather than a timeout to the next boundary because a
    // tablet that sleeps through it would fire late; this self-corrects.
    timer = setInterval(poll, 60_000);
    // Catch up immediately when the tablet wakes or the tab is looked at again.
    document.addEventListener("visibilitychange", poll);
    window.addEventListener("focus", poll);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", poll);
      window.removeEventListener("focus", poll);
    }
  };
}

function getSnapshot(): TimeSlotTick {
  // The same object identity until poll() reports a change, as the store contract
  // requires — a fresh object each call would loop.
  cached ??= { slot: getCurrentTimeSlot(), generation };
  return cached;
}

// The server has no idea what time it is where the tablet is, so it renders the
// unfiltered view and the client picks a slot on hydration.
function getServerSnapshot(): null {
  return null;
}

export function useCurrentTimeSlot(): TimeSlotTick | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
