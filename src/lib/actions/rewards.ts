import { addDoc, serverTimestamp } from "firebase/firestore";
import { redemptionsCollection } from "../collections";

export async function redeemReward(
  rewardId: string,
  rewardName: string,
  profileId: string,
  starCost: number
) {
  await addDoc(redemptionsCollection, {
    rewardId,
    rewardName,
    profileId,
    starCost,
    redeemedAt: serverTimestamp(),
  });
}
