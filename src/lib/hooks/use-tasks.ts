"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, where, type QueryConstraint } from "firebase/firestore";
import { tasksCollection } from "../collections";
import type { Task } from "@/types";

export function useTasks(profileId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints: QueryConstraint[] = [orderBy("order", "asc")];
    if (profileId) {
      constraints.unshift(where("profileId", "==", profileId));
    }
    const q = query(tasksCollection, ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [profileId]);

  return { tasks, loading };
}
