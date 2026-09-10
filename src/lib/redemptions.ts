import type { Redemption } from "@/types";

/**
 * True while the redemption still counts against the profile's stars. An
 * undone one stays in the collection so History can show it, but has already
 * given its stars back.
 */
export function isRedemptionActive(redemption: Pick<Redemption, "undoneAt">): boolean {
  return !redemption.undoneAt;
}
