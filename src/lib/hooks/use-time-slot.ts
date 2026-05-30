"use client";

import { useState, useEffect } from "react";
import { getCurrentTimeSlot } from "../utils";
import type { TimeSlot } from "@/types";

export function useTimeSlot(): TimeSlot {
  const [slot, setSlot] = useState<TimeSlot>(getCurrentTimeSlot);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlot(getCurrentTimeSlot());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return slot;
}
