"use client";

import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { settingsDoc } from "../collections";
import { DEFAULT_FAMILY_NAME } from "../constants";
import type { Settings } from "@/types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    familyName: DEFAULT_FAMILY_NAME,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as Settings);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { settings, loading };
}
