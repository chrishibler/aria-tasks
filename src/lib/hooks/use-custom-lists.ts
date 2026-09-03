"use client";

import { useState, useEffect, useMemo } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { listsCollection } from "../collections";
import type { CustomList } from "@/types";

export function useCustomLists() {
  const [allLists, setAllLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(listsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomList[];
      setAllLists(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Partitioned in memory rather than with a `where` clause: lists created
  // before soft delete existed have no `deletedAt` field at all, and Firestore
  // equality filters never match a missing field.
  const lists = useMemo(() => allLists.filter((l) => !l.deletedAt), [allLists]);
  const deletedLists = useMemo(() => allLists.filter((l) => l.deletedAt), [allLists]);

  return { lists, deletedLists, loading };
}
