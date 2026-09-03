"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, where, type QueryConstraint } from "firebase/firestore";
import { completionsCollection, tasksCollection, redemptionsCollection } from "../collections";
import type { Task, Completion, Redemption } from "@/types";

export function useStars(profileId?: string) {
  const [earned, setEarned] = useState(0);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tasks: Task[] = [];
    let completions: Completion[] = [];
    let redemptions: Redemption[] = [];
    const loaded = { tasks: false, completions: false, redemptions: false };

    function recalculate() {
      if (!loaded.tasks || !loaded.completions || !loaded.redemptions) return;

      const taskStarMap = new Map(tasks.map((t) => [t.id, t.stars]));
      const totalEarned = completions.reduce(
        (sum, c) => sum + (taskStarMap.get(c.taskId) || 0),
        0
      );
      const totalSpent = redemptions.reduce((sum, r) => sum + r.starCost, 0);

      setEarned(totalEarned);
      setSpent(totalSpent);
      setLoading(false);
    }

    // Tasks: filter by profileId if given
    const taskConstraints: QueryConstraint[] = [];
    if (profileId) taskConstraints.push(where("profileId", "==", profileId));
    const unsubTasks = onSnapshot(query(tasksCollection, ...taskConstraints), (snap) => {
      tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Task[];
      loaded.tasks = true;
      recalculate();
    });

    // Completions: filter by profileId if given
    const compConstraints: QueryConstraint[] = [];
    if (profileId) compConstraints.push(where("profileId", "==", profileId));
    const unsubCompletions = onSnapshot(query(completionsCollection, ...compConstraints), (snap) => {
      completions = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Completion[];
      loaded.completions = true;
      recalculate();
    });

    // Redemptions: filter by profileId if given
    const redConstraints: QueryConstraint[] = [];
    if (profileId) redConstraints.push(where("profileId", "==", profileId));
    const unsubRedemptions = onSnapshot(query(redemptionsCollection, ...redConstraints), (snap) => {
      redemptions = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Redemption[];
      loaded.redemptions = true;
      recalculate();
    });

    return () => {
      unsubTasks();
      unsubCompletions();
      unsubRedemptions();
    };
  }, [profileId]);

  return { earned, spent, balance: earned - spent, loading };
}
