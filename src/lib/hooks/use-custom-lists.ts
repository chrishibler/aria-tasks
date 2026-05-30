"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { listsCollection } from "../collections";
import type { CustomList } from "@/types";

export function useCustomLists() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(listsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomList[];
      setLists(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { lists, loading };
}
