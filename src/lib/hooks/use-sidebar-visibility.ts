"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "aria-sidebar-hidden";

// localStorage is an external store, so subscribe to it rather than mirroring
// it into state from an effect. Mirrors the approach in use-pin-auth.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs/windows on the same device in sync.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

// The sidebar is shown during SSR; the client re-reads on hydration, so a
// hidden sidebar can't cause a markup mismatch.
function getServerSnapshot() {
  return false;
}

export function useSidebarHidden() {
  const hidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setHidden = useCallback((value: boolean) => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, "true");
      document.documentElement.dataset.sidebarHidden = "true";
    } else {
      localStorage.removeItem(STORAGE_KEY);
      // Must clear too, or the pre-paint CSS rule would pin the width at 0.
      delete document.documentElement.dataset.sidebarHidden;
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { hidden, setHidden };
}
