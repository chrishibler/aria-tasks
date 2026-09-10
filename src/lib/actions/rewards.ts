import { addDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { redemptionsCollection } from "../collections";
import { db } from "../firebase";
import { getProfileBalance } from "./stars";

export type RedeemResult =
  /** `redemptionId` is what an undo needs to reverse this exact redemption. */
  | { ok: true; redemptionId: string }
  | { ok: false; balance: number; shortfall: number };

/**
 * The affordability check lives here rather than only on the disabled button,
 * so a stale UI balance (another device, a double tap before the snapshot
 * lands) can't overspend.
 */
export async function redeemReward(
  rewardId: string,
  rewardName: string,
  profileId: string,
  starCost: number
): Promise<RedeemResult> {
  const { balance } = await getProfileBalance(profileId);

  if (balance < starCost) {
    return { ok: false, balance, shortfall: starCost - balance };
  }

  const ref = await addDoc(redemptionsCollection, {
    rewardId,
    rewardName,
    profileId,
    starCost,
    redeemedAt: serverTimestamp(),
  });
  return { ok: true, redemptionId: ref.id };
}

/**
 * Gives the stars back by stamping the redemption undone rather than deleting
 * it, so History still shows the reward was taken and then handed back.
 *
 * There is no balance guard here, unlike redeem and un-check: an undo only
 * ever returns stars, so it can't push anyone below zero. Re-undoing an entry
 * that is already undone is a no-op — callers hide the control once it is.
 */
export async function undoRedemption(redemptionId: string): Promise<void> {
  await updateDoc(doc(db, "redemptions", redemptionId), {
    undoneAt: serverTimestamp(),
  });
}
