"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getRotatingPin } from "../constants";

const SESSION_KEY = "aria-admin-auth";

// sessionStorage is an external store, so subscribe to it rather than mirroring
// it into state from an effect. Writes go through setAuthenticated() below.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

// Nothing is authenticated during SSR; the client re-reads on hydration.
function getServerSnapshot() {
  return false;
}

function setAuthenticated(value: boolean) {
  if (value) sessionStorage.setItem(SESSION_KEY, "true");
  else sessionStorage.removeItem(SESSION_KEY);
  listeners.forEach((listener) => listener());
}

export function usePinAuth() {
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Evaluated per attempt, so the code follows the date without a reload.
  const verify = useCallback(async (pin: string): Promise<boolean> => {
    const match = pin === getRotatingPin();
    if (match) {
      setAuthenticated(true);
    }
    return match;
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
  }, []);

  return { isAuthenticated, verify, logout };
}
