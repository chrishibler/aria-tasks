"use client";

import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { settingsDoc } from "../collections";
import { DEFAULT_FAMILY_NAME, DEFAULT_PIN } from "../constants";
import type { Settings } from "@/types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    pin: DEFAULT_PIN,
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
