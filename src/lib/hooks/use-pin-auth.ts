"use client";

import { useState, useCallback, useEffect } from "react";
import { getDoc } from "firebase/firestore";
import { settingsDoc } from "../collections";
import { DEFAULT_PIN } from "../constants";

const SESSION_KEY = "aria-admin-auth";

export function usePinAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(sessionStorage.getItem(SESSION_KEY) === "true");
    }
  }, []);

  const verify = useCallback(async (pin: string): Promise<boolean> => {
    const snap = await getDoc(settingsDoc);
    const storedPin = snap.exists() ? (snap.data().pin as string) : DEFAULT_PIN;
    const match = pin === storedPin;
    if (match) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
    }
    return match;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, verify, logout };
}
