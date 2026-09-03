"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, where, type QueryConstraint } from "firebase/firestore";
import { adjustmentsCollection } from "../collections";
import type { Adjustment } from "@/types";

export function useAdjustments(profileId?: string) {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
    if (profileId) {
      constraints.unshift(where("profileId", "==", profileId));
    }
    const q = query(adjustmentsCollection, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Adjustment[];
      setAdjustments(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [profileId]);

  return { adjustments, loading };
}
