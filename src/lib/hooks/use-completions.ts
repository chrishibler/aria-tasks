"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, where, type QueryConstraint } from "firebase/firestore";
import { completionsCollection } from "../collections";
import type { Completion } from "@/types";

export function useCompletions(options?: {
  profileId?: string;
  date?: string;
  todayOnly?: boolean;
}) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const profileId = options?.profileId;
  const date = options?.date;
  const todayOnly = options?.todayOnly ?? false;

  useEffect(() => {
    const constraints: QueryConstraint[] = [];

    if (date) {
      constraints.push(where("date", "==", date));
    } else if (todayOnly) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      constraints.push(where("date", "==", dateStr));
    }

    if (profileId) {
      constraints.push(where("profileId", "==", profileId));
    }

    const q = query(completionsCollection, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Completion[];
      setCompletions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [profileId, date, todayOnly]);

  return { completions, loading };
}
