import { getDocs, query, where } from "firebase/firestore";
import {
  tasksCollection,
  completionsCollection,
  redemptionsCollection,
} from "../collections";
import type { Task, Completion, Redemption } from "@/types";

export interface StarBalance {
  earned: number;
  spent: number;
  balance: number;
}

/**
 * Recomputes a profile's star balance straight from Firestore, rather than
 * trusting a value the UI is holding (which may be stale, or from another
 * device). Mirrors useStars(): a completion whose task no longer exists
 * contributes 0 stars.
 */
export async function getProfileBalance(profileId: string): Promise<StarBalance> {
  const [taskSnap, completionSnap, redemptionSnap] = await Promise.all([
    getDocs(query(tasksCollection, where("profileId", "==", profileId))),
    getDocs(query(completionsCollection, where("profileId", "==", profileId))),
    getDocs(query(redemptionsCollection, where("profileId", "==", profileId))),
  ]);

  const starsByTask = new Map(
    taskSnap.docs.map((d) => [d.id, (d.data() as Task).stars ?? 0])
  );
  const earned = completionSnap.docs.reduce(
    (sum, d) => sum + (starsByTask.get((d.data() as Completion).taskId) || 0),
    0
  );
  const spent = redemptionSnap.docs.reduce(
    (sum, d) => sum + ((d.data() as Redemption).starCost || 0),
    0
  );

  return { earned, spent, balance: earned - spent };
}
