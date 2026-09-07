"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getDocFromServer,
  getDocsFromServer,
  limit,
  onSnapshot,
  query,
  setLogLevel,
} from "firebase/firestore";
import { profilesCollection, settingsDoc } from "@/lib/collections";
import { firebaseConfig, firestoreSettings } from "@/lib/firebase";

/**
 * On-device diagnostics for the "UI loads but no data" problem. Everything
 * here runs in the browser so it can be read on an iPad with no Mac attached.
 * Reach it at /debug (or via Admin → Settings → Diagnostics).
 */

type Status = "pending" | "ok" | "fail";

type Check = {
  id: string;
  label: string;
  status: Status;
  detail: string;
  ms?: number;
};

type LogEntry = { t: number; level: string; msg: string };

type EarlyError = { t: number; msg: string; src?: string };

declare global {
  interface Window {
    __ariaDebug?: { t0: number; errors: EarlyError[] };
  }
}

const TIMEOUT_MS = 15_000;
const MAX_LOG = 400;

// Installed before React so it catches chunk-load and hydration errors that
// would otherwise leave the page blank. See the <script> in the JSX.
const EARLY_SCRIPT = `
window.__ariaDebug = window.__ariaDebug || { t0: Date.now(), errors: [] };
(function () {
  var el = document.getElementById('debug-early');
  var base = 'Scripts are running. Waiting for the app to start... ' + navigator.userAgent;
  function render() {
    if (!el || !el.isConnected) return;
    var errs = window.__ariaDebug.errors;
    var text = base;
    if (errs.length) {
      text += '\n\nErrors so far (' + errs.length + '):';
      for (var i = 0; i < errs.length; i++) text += '\n- ' + errs[i].msg + (errs[i].src ? ' @ ' + errs[i].src : '');
    }
    el.textContent = text;
  }
  window.addEventListener('error', function (e) {
    window.__ariaDebug.errors.push({ t: Date.now(), msg: String((e && e.message) || e), src: e && e.filename ? e.filename + ':' + e.lineno : '' });
    render();
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    window.__ariaDebug.errors.push({ t: Date.now(), msg: 'unhandledrejection: ' + (r && r.message ? r.message : String(r)) });
    render();
  });
  render();
  // If React still hasn't taken over after a while, say so explicitly.
  setTimeout(function () {
    if (el && el.isConnected) { base += '\n\nStill no app after 8s: a script failed to load or parse on this device.'; render(); }
  }, 8000);
})();
`;

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`timed out after ${ms / 1000}s`)), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      }
    );
  });
}

function errText(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as { code?: string; name?: string; message?: string };
    return [o.code ?? o.name, o.message].filter(Boolean).join(": ") || String(e);
  }
  return String(e);
}

function fmtTime(t: number) {
  return new Date(t).toISOString().slice(11, 23);
}

// false on the server and during hydration, true afterwards — without a
// setState-in-effect.
const noopSubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

function collectEnv(): Record<string, string> {
  const nav = navigator as Navigator & { standalone?: boolean };
  const standalone =
    nav.standalone === true || window.matchMedia?.("(display-mode: standalone)").matches;
  return {
    "Build": `${process.env.NEXT_PUBLIC_BUILD_SHA ?? "?"} (${process.env.NEXT_PUBLIC_BUILD_TIME ?? "?"})`,
    "Page URL": location.href,
    "User agent": navigator.userAgent,
    "Display mode": standalone ? "standalone (Home Screen app)" : "browser tab",
    "Online (navigator.onLine)": String(navigator.onLine),
    "Viewport": `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`,
    "Device time": new Date().toString(),
    "Time zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    "Cookies enabled": String(navigator.cookieEnabled),
    "localStorage": safeStorage("localStorage"),
    "sessionStorage": safeStorage("sessionStorage"),
    "IndexedDB": typeof indexedDB === "undefined" ? "missing" : "present",
    "Firebase projectId": firebaseConfig.projectId ?? "MISSING",
    "Firebase apiKey": firebaseConfig.apiKey ? `present (…${firebaseConfig.apiKey.slice(-4)})` : "MISSING",
    "Firebase appId": firebaseConfig.appId ? "present" : "MISSING",
    "Firestore settings": JSON.stringify(firestoreSettings),
  };
}

function safeStorage(name: "localStorage" | "sessionStorage"): string {
  try {
    const s = window[name];
    const k = "__aria_debug__";
    s.setItem(k, "1");
    s.removeItem(k);
    return "ok";
  } catch (e) {
    return "FAIL " + errText(e);
  }
}

export default function DebugPage() {
  const mounted = useMounted();
  const [sw, setSw] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Check[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runId, setRunId] = useState(0);
  // Both are plain reads of browser state; recomputed on each re-run.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const env = useMemo(() => (mounted ? collectEnv() : {}), [mounted, runId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const earlyErrors = useMemo<EarlyError[]>(() => (mounted ? window.__ariaDebug?.errors ?? [] : []), [mounted, runId]);
  const [copied, setCopied] = useState<string | null>(null);
  const logsRef = useRef<LogEntry[]>([]);

  const pushLog = useCallback((level: string, msg: string) => {
    const next = [...logsRef.current, { t: Date.now(), level, msg }].slice(-MAX_LOG);
    logsRef.current = next;
    setLogs(next);
  }, []);

  const setCheck = useCallback((c: Check) => {
    setChecks((prev) => {
      const i = prev.findIndex((x) => x.id === c.id);
      if (i === -1) return [...prev, c];
      const copy = prev.slice();
      copy[i] = c;
      return copy;
    });
  }, []);

  // Run one probe, recording timing and outcome.
  const probe = useCallback(
    async (id: string, label: string, fn: () => Promise<string>) => {
      setCheck({ id, label, status: "pending", detail: "running…" });
      const t0 = performance.now();
      try {
        const detail = await fn();
        setCheck({ id, label, status: "ok", detail, ms: Math.round(performance.now() - t0) });
      } catch (e) {
        setCheck({ id, label, status: "fail", detail: errText(e), ms: Math.round(performance.now() - t0) });
      }
    },
    [setCheck]
  );

  // Service worker + cache state.
  useEffect(() => {
    if (!mounted) return;
    (async () => {
      const out: Record<string, string> = {};
      if (!("serviceWorker" in navigator)) {
        out["Service worker"] = "unsupported";
      } else {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          out["Registrations"] = String(regs.length);
          regs.forEach((r, i) => {
            const w = r.active ?? r.waiting ?? r.installing;
            out[`Registration ${i + 1}`] = `${r.scope} → ${w ? `${w.scriptURL} (${w.state})` : "no worker"}`;
          });
          out["Controlling this page"] = navigator.serviceWorker.controller ? "yes" : "no";
        } catch (e) {
          out["Service worker"] = "FAIL " + errText(e);
        }
      }
      if (typeof caches === "undefined") {
        out["Cache Storage"] = "unsupported";
      } else {
        try {
          const keys = await caches.keys();
          out["Cache Storage"] = keys.length ? keys.join(", ") : "empty";
        } catch (e) {
          out["Cache Storage"] = "FAIL " + errText(e);
        }
      }
      setSw(out);
    })();
  }, [mounted, runId]);

  // Capture console output while this page is open, with Firestore's own
  // logger turned up so transport errors show on-device.
  useEffect(() => {
    if (!mounted) return;
    const levels = ["log", "info", "warn", "error", "debug"] as const;
    const originals: Partial<Record<(typeof levels)[number], (...a: unknown[]) => void>> = {};
    const toText = (a: unknown) => {
      if (typeof a === "string") return a;
      if (a instanceof Error) return errText(a);
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    };
    for (const lvl of levels) {
      const orig = console[lvl].bind(console);
      originals[lvl] = orig;
      console[lvl] = (...args: unknown[]) => {
        pushLog(lvl, args.map(toText).join(" "));
        orig(...args);
      };
    }
    const onErr = (e: ErrorEvent) => pushLog("window.error", `${e.message} @ ${e.filename}:${e.lineno}`);
    const onRej = (e: PromiseRejectionEvent) => pushLog("unhandledrejection", errText(e.reason));
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    setLogLevel("debug");
    return () => {
      setLogLevel("warn");
      for (const lvl of levels) {
        const orig = originals[lvl];
        if (orig) console[lvl] = orig;
      }
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, [mounted, pushLog]);

  // Network + Firestore probes. Kicked off from a timer so the effect body
  // itself never sets state (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    let listenTimer: ReturnType<typeof setTimeout> | undefined;

    const kick = setTimeout(() => {
      if (cancelled) return;
      const projectId = firebaseConfig.projectId ?? "";
      const apiKey = firebaseConfig.apiKey ?? "";

      // 1. Same-origin control: proves the app's own host is reachable.
      probe("origin", "Same-origin fetch (/manifest.webmanifest)", async () => {
        const r = await withTimeout(fetch("/manifest.webmanifest", { cache: "no-store" }));
        return `HTTP ${r.status}`;
      });

      // 2. Plain reachability of Google hosts. no-cors gives an opaque response
      //    (status 0) when the host answered at all, and throws when blocked.
      for (const host of [
        "https://firestore.googleapis.com/",
        "https://firebase.googleapis.com/",
        "https://www.google.com/generate_204",
      ]) {
        probe(`reach:${host}`, `Reach ${new URL(host).host}`, async () => {
          const r = await withTimeout(fetch(host, { mode: "no-cors", cache: "no-store" }));
          return `responded (type=${r.type}, status=${r.status})`;
        });
      }

      // 3. Firestore REST read, bypassing the SDK entirely. Any HTTP status,
      //    even 403, means the filter let the request through.
      probe("rest", "Firestore REST read (settings/main)", async () => {
        if (!projectId || !apiKey) throw new Error("projectId or apiKey missing from build");
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/main?key=${apiKey}`;
        const r = await withTimeout(fetch(url, { cache: "no-store" }));
        const body = await r.text();
        return `HTTP ${r.status}; ${body.length} bytes: ${body.slice(0, 160).replace(/\s+/g, " ")}`;
      });

      // 4. SDK one-shot reads that must hit the server.
      probe("sdk-doc", "SDK getDocFromServer(settings/main)", async () => {
        const snap = await withTimeout(getDocFromServer(settingsDoc));
        return snap.exists()
          ? `exists; keys=${Object.keys(snap.data()).join(",")}`
          : "document missing (server answered)";
      });
      probe("sdk-query", "SDK getDocsFromServer(profiles limit 1)", async () => {
        const snap = await withTimeout(getDocsFromServer(query(profilesCollection, limit(1))));
        return `${snap.size} doc(s)`;
      });

      // 5. The real thing: a live listener, exactly what the app's hooks use.
      const label = "SDK onSnapshot(profiles) live listener";
      const t0 = performance.now();
      let events = 0;
      setCheck({ id: "listen", label, status: "pending", detail: "waiting for first snapshot…" });
      listenTimer = setTimeout(() => {
        if (events === 0) {
          setCheck({
            id: "listen",
            label,
            status: "fail",
            detail: "no snapshot after 15s — this is the hang the tasks page shows",
            ms: TIMEOUT_MS,
          });
        }
      }, TIMEOUT_MS);
      unsub = onSnapshot(
        query(profilesCollection, limit(5)),
        { includeMetadataChanges: true },
        (snap) => {
          events += 1;
          const ms = Math.round(performance.now() - t0);
          const src = snap.metadata.fromCache ? "cache" : "server";
          pushLog("snapshot", `#${events} ${snap.size} docs from ${src} at +${ms}ms`);
          setCheck({
            id: "listen",
            label,
            status: snap.metadata.fromCache ? "pending" : "ok",
            detail: `${events} event(s); latest: ${snap.size} docs from ${src}`,
            ms,
          });
        },
        (err) => {
          if (listenTimer) clearTimeout(listenTimer);
          setCheck({ id: "listen", label, status: "fail", detail: errText(err), ms: Math.round(performance.now() - t0) });
        }
      );
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(kick);
      if (listenTimer) clearTimeout(listenTimer);
      unsub?.();
    };
  }, [mounted, runId, probe, pushLog, setCheck]);

  const report = () => {
    const lines: string[] = [];
    lines.push(`# Aria's Tasks diagnostics — ${new Date().toISOString()}`);
    lines.push("", "## Environment");
    for (const [k, v] of Object.entries(env)) lines.push(`${k}: ${v}`);
    lines.push("", "## Service worker");
    for (const [k, v] of Object.entries(sw)) lines.push(`${k}: ${v}`);
    lines.push("", "## Checks");
    for (const c of checks) lines.push(`[${c.status.toUpperCase()}] ${c.label} — ${c.detail}${c.ms != null ? ` (${c.ms}ms)` : ""}`);
    lines.push("", "## Early errors (before React)");
    if (earlyErrors.length === 0) lines.push("none");
    for (const e of earlyErrors) lines.push(`${fmtTime(e.t)} ${e.msg}${e.src ? ` @ ${e.src}` : ""}`);
    lines.push("", `## Console (last ${logs.length})`);
    for (const l of logs) lines.push(`${fmtTime(l.t)} [${l.level}] ${l.msg}`);
    return lines.join("\n");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report());
      setCopied("Copied to clipboard");
    } catch {
      setCopied("Copy failed — long-press the text box below, Select All, Copy");
    }
    setTimeout(() => setCopied(null), 4000);
  };

  const resetSw = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } finally {
      location.reload();
    }
  };

  const badge = (s: Status) =>
    s === "ok" ? "bg-emerald-100 text-emerald-800" : s === "fail" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";

  return (
    <div className="mx-auto max-w-3xl p-4 text-sm text-gray-900">
      <h1 className="text-xl font-bold">Diagnostics</h1>

      {/* Text below is replaced by the inline script (before React) and then by
          React itself. If either message is still visible, JavaScript failed
          at that stage. suppressHydrationWarning: the script edits this text. */}
      {!mounted && (
        <p id="debug-early" suppressHydrationWarning className="mt-3 whitespace-pre-wrap break-words rounded-md bg-amber-50 p-3 text-amber-900">
          Waiting for scripts to load… If this message stays, JavaScript is not running on this
          device at all.
        </p>
      )}
      <script dangerouslySetInnerHTML={{ __html: EARLY_SCRIPT }} />

      {mounted && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setChecks([]);
                logsRef.current = [];
                setLogs([]);
                setRunId((n) => n + 1);
              }} className="rounded-md bg-gray-900 px-3 py-2 font-semibold text-white">
              Re-run checks
            </button>
            <button onClick={copyReport} className="rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold">
              Copy report
            </button>
            <button onClick={resetSw} className="rounded-md border border-red-300 bg-white px-3 py-2 font-semibold text-red-700">
              Reset service worker + caches, reload
            </button>
            <Link href="/tasks" className="rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold">
              Back to Tasks
            </Link>
          </div>
          {copied && <p className="mt-2 text-emerald-700">{copied}</p>}

          <Section title="Checks">
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.id} className="rounded-md border border-gray-200 p-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase ${badge(c.status)}`}>{c.status}</span>
                    <span className="font-semibold">{c.label}</span>
                    {c.ms != null && <span className="ml-auto text-xs text-gray-500">{c.ms} ms</span>}
                  </div>
                  <div className="mt-1 break-all font-mono text-xs text-gray-700">{c.detail}</div>
                </li>
              ))}
            </ul>
          </Section>

          {earlyErrors.length > 0 && (
            <Section title="Errors before React started">
              <KV rows={earlyErrors.map((e) => [fmtTime(e.t), `${e.msg}${e.src ? ` @ ${e.src}` : ""}`])} />
            </Section>
          )}

          <Section title="Environment">
            <KV rows={Object.entries(env)} />
          </Section>

          <Section title="Service worker">
            <KV rows={Object.entries(sw)} />
          </Section>

          <Section title={`Console (${logs.length})`}>
            <div className="max-h-80 overflow-auto rounded-md bg-gray-950 p-2 font-mono text-[11px] leading-snug text-gray-100">
              {logs.length === 0 && <div className="text-gray-400">nothing logged yet</div>}
              {logs.map((l, i) => (
                <div key={i} className={l.level === "error" || l.level.includes("reject") ? "text-red-300" : l.level === "warn" ? "text-amber-300" : ""}>
                  {fmtTime(l.t)} [{l.level}] {l.msg}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Full report (select all to copy manually)">
            <textarea readOnly value={report()} className="h-48 w-full rounded-md border border-gray-300 p-2 font-mono text-[11px]" />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

function KV({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-gray-200 rounded-md border border-gray-200">
      {rows.map(([k, v], i) => (
        <div key={`${i}-${k}`} className="grid grid-cols-[minmax(8rem,1fr)_2fr] gap-2 p-2">
          <dt className="font-semibold text-gray-600">{k}</dt>
          <dd className="break-all font-mono text-xs">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
