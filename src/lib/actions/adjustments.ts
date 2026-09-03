import { addDoc, serverTimestamp } from "firebase/firestore";
import { adjustmentsCollection } from "../collections";
import { getProfileBalance } from "./stars";
import type { Adjustment } from "@/types";

export type AdjustResult =
  | { ok: true }
  | { ok: false; balance: number; shortfall: number };

/**
 * Writes one entry to the parent adjustment ledger.
 *
 * Like the un-check and redeem guards, a take-away re-reads the balance here
 * rather than trusting the number the admin screen is showing, and refuses to
 * push a profile below zero: a negative balance is the state the guards exist
 * to prevent, and a parent shouldn't be able to create one from the side door.
 */
export async function addAdjustment(
  profileId: string,
  stars: number,
  reason: string,
  reversesId?: string
): Promise<AdjustResult> {
  if (!Number.isInteger(stars) || stars === 0) {
    throw new Error(`Adjustment must be a non-zero whole number, got ${stars}`);
  }

  const { balance } = await getProfileBalance(profileId);

  if (balance + stars < 0) {
    return { ok: false, balance, shortfall: -(balance + stars) };
  }

  await addDoc(adjustmentsCollection, {
    profileId,
    stars,
    reason: reason.trim(),
    ...(reversesId ? { reversesId } : {}),
    createdAt: serverTimestamp(),
  });
  return { ok: true };
}

/**
 * Undoes an entry by appending its opposite. The ledger is never rewritten, so
 * both the mistake and its correction stay visible.
 */
export async function reverseAdjustment(entry: Adjustment): Promise<AdjustResult> {
  return addAdjustment(
    entry.profileId,
    -entry.stars,
    `Reversed: ${entry.reason}`,
    entry.id
  );
}
