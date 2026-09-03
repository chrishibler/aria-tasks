"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, where, type QueryConstraint } from "firebase/firestore";
import {
  completionsCollection,
  tasksCollection,
  redemptionsCollection,
  adjustmentsCollection,
} from "../collections";
import type { Task, Completion, Redemption, Adjustment } from "@/types";

export function useStars(profileId?: string) {
  const [earned, setEarned] = useState(0);
  const [spent, setSpent] = useState(0);
  const [adjusted, setAdjusted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tasks: Task[] = [];
    let completions: Completion[] = [];
    let redemptions: Redemption[] = [];
    let adjustments: Adjustment[] = [];
    const loaded = { tasks: false, completions: false, redemptions: false, adjustments: false };

    function recalculate() {
      if (!loaded.tasks || !loaded.completions || !loaded.redemptions || !loaded.adjustments) {
        return;
      }

      const taskStarMap = new Map(tasks.map((t) => [t.id, t.stars]));
      const totalEarned = completions.reduce(
        (sum, c) => sum + (taskStarMap.get(c.taskId) || 0),
        0
      );
      const totalSpent = redemptions.reduce((sum, r) => sum + r.starCost, 0);
      const totalAdjusted = adjustments.reduce((sum, a) => sum + a.stars, 0);

      setEarned(totalEarned);
      setSpent(totalSpent);
      setAdjusted(totalAdjusted);
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

    // Adjustments: the parent ledger, filter by profileId if given
    const adjConstraints: QueryConstraint[] = [];
    if (profileId) adjConstraints.push(where("profileId", "==", profileId));
    const unsubAdjustments = onSnapshot(query(adjustmentsCollection, ...adjConstraints), (snap) => {
      adjustments = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Adjustment[];
      loaded.adjustments = true;
      recalculate();
    });

    return () => {
      unsubTasks();
      unsubCompletions();
      unsubRedemptions();
      unsubAdjustments();
    };
  }, [profileId]);

  return { earned, spent, adjusted, balance: earned + adjusted - spent, loading };
}
