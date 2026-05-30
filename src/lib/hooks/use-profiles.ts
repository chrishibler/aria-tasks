"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { profilesCollection } from "../collections";
import type { Profile } from "@/types";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(profilesCollection, orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Profile[];
      setProfiles(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { profiles, loading };
}
