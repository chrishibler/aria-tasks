import { getDocs, query, where } from "firebase/firestore";
import {
  tasksCollection,
  completionsCollection,
  redemptionsCollection,
  adjustmentsCollection,
} from "../collections";
import { isRedemptionActive } from "../redemptions";
import type { Task, Completion, Redemption, Adjustment } from "@/types";

export interface StarBalance {
  earned: number;
  /** Net of the parent adjustment ledger: may be negative. */
  adjusted: number;
  spent: number;
  balance: number;
}

/**
 * Recomputes a profile's star balance straight from Firestore, rather than
 * trusting a value the UI is holding (which may be stale, or from another
 * device). Mirrors useStars(): a completion whose task no longer exists
 * contributes 0 stars, and an undone redemption no longer counts as spent.
 */
export async function getProfileBalance(profileId: string): Promise<StarBalance> {
  const [taskSnap, completionSnap, redemptionSnap, adjustmentSnap] = await Promise.all([
    getDocs(query(tasksCollection, where("profileId", "==", profileId))),
    getDocs(query(completionsCollection, where("profileId", "==", profileId))),
    getDocs(query(redemptionsCollection, where("profileId", "==", profileId))),
    getDocs(query(adjustmentsCollection, where("profileId", "==", profileId))),
  ]);

  const starsByTask = new Map(
    taskSnap.docs.map((d) => [d.id, (d.data() as Task).stars ?? 0])
  );
  const earned = completionSnap.docs.reduce(
    (sum, d) => sum + (starsByTask.get((d.data() as Completion).taskId) || 0),
    0
  );
  const spent = redemptionSnap.docs
    .map((d) => d.data() as Redemption)
    .filter(isRedemptionActive)
    .reduce((sum, r) => sum + (r.starCost || 0), 0);
  const adjusted = adjustmentSnap.docs.reduce(
    (sum, d) => sum + ((d.data() as Adjustment).stars || 0),
    0
  );

  return { earned, adjusted, spent, balance: earned + adjusted - spent };
}
