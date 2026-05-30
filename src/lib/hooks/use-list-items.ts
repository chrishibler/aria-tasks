"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, where, orderBy, type QueryConstraint } from "firebase/firestore";
import { listItemsCollection } from "../collections";
import type { ListItem } from "@/types";

export function useListItems(listId: string) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [
      where("listId", "==", listId),
      orderBy("order", "asc"),
    ];
    const q = query(listItemsCollection, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ListItem[];
      setItems(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [listId]);

  return { items, loading };
}
