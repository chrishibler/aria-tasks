"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only — in dev it would sit in
 * front of HMR and serve stale assets.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal: the app works without it.
      });
    };

    // Hydration usually runs after `load` has already fired, so waiting on the
    // event alone would never register. Only defer if the page is still loading.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
