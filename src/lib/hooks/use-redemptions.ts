"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, where, type QueryConstraint } from "firebase/firestore";
import { redemptionsCollection } from "../collections";
import type { Redemption } from "@/types";

export function useRedemptions(profileId?: string) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [orderBy("redeemedAt", "desc")];
    if (profileId) {
      constraints.unshift(where("profileId", "==", profileId));
    }
    const q = query(redemptionsCollection, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Redemption[];
      setRedemptions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [profileId]);

  return { redemptions, loading };
}
