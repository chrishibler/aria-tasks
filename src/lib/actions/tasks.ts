import { addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { completionsCollection } from "../collections";
import { db } from "../firebase";
import { getProfileBalance } from "./stars";

export async function completeTask(taskId: string, profileId: string, date: string) {
  await addDoc(completionsCollection, {
    taskId,
    profileId,
    date,
    completedAt: serverTimestamp(),
  });
}

export type UncompleteResult =
  | { ok: true }
  | { ok: false; shortfall: number; spent: number };

/**
 * Refuses to un-check a task when doing so would push the profile's balance
 * below zero — i.e. those stars have already been spent on a reward. The
 * balance is re-read here rather than passed in, so a stale UI value can't
 * authorise an overdraw.
 */
export async function uncompleteTask(
  completionId: string,
  profileId: string,
  taskStars: number
): Promise<UncompleteResult> {
  const { spent, balance } = await getProfileBalance(profileId);
  const balanceAfter = balance - taskStars;

  if (balanceAfter < 0) {
    return { ok: false, shortfall: -balanceAfter, spent };
  }

  await deleteDoc(doc(db, "completions", completionId));
  return { ok: true };
}
