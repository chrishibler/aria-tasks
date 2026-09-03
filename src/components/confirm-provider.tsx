"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. Defaults to true. */
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based replacement for window.confirm():
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Delete this?" })) { ... }
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (opts) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setOptions(opts);
      }),
    []
  );

  // Every exit path settles the promise, so an awaiting caller can never hang —
  // dismissing with Escape or an outside click resolves false, like confirm().
  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Dialog
          isOpen
          onOpenChange={(open) => {
            if (!open) settle(false);
          }}
          showCloseButton={false}
          className="gap-0 rounded-2xl p-0 shadow-xl ring-0 sm:max-w-sm"
        >
          <div className="px-6 pt-6">
            <div className="flex gap-4">
              <span
                aria-hidden
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <DialogTitle className="font-[family-name:var(--font-nunito)] text-lg font-extrabold normal-case tracking-normal">
                  {options.title}
                </DialogTitle>
                {options.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {options.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t bg-muted/30 px-6 py-4">
            <Button
              variant="ghost"
              onPress={() => settle(false)}
              className="rounded-full text-sm normal-case tracking-normal"
            >
              {options.cancelLabel ?? "Cancel"}
            </Button>
            <Button
              autoFocus
              onPress={() => settle(true)}
              className={cn(
                "rounded-full px-6 text-sm normal-case tracking-normal",
                destructive && "bg-destructive text-white hover:bg-destructive/90"
              )}
            >
              {options.confirmLabel ?? "Confirm"}
            </Button>
          </div>
        </Dialog>
      )}
    </ConfirmContext.Provider>
  );
}
