import { addDoc, serverTimestamp } from "firebase/firestore";
import { redemptionsCollection } from "../collections";
import { getProfileBalance } from "./stars";

export type RedeemResult =
  | { ok: true }
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

  await addDoc(redemptionsCollection, {
    rewardId,
    rewardName,
    profileId,
    starCost,
    redeemedAt: serverTimestamp(),
  });
  return { ok: true };
}
