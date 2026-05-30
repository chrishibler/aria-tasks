"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, where, orderBy, type QueryConstraint } from "firebase/firestore";
import { rewardsCollection } from "../collections";
import type { Reward } from "@/types";

export function useRewards(availableOnly = false) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [orderBy("starCost", "asc")];
    if (availableOnly) {
      constraints.unshift(where("available", "==", true));
    }
    const q = query(rewardsCollection, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reward[];
      setRewards(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [availableOnly]);

  return { rewards, loading };
}
