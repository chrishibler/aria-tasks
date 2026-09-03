"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LockClosedIcon, BackspaceIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PinModalProps {
  onVerify: (pin: string) => Promise<boolean>;
}

export function PinModal({ onVerify }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 6) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
    },
    [pin]
  );

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (pin.length < 4) return;
    setChecking(true);
    const result = await onVerify(pin);
    if (!result) {
      setError(true);
      setPin("");
    }
    setChecking(false);
  }, [pin, onVerify]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-xs flex-col items-center gap-6"
      >
        <div className="rounded-full bg-muted p-4">
          <LockClosedIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Parent Access</h2>

        {/* PIN dots */}
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? error
                    ? "border-destructive bg-destructive"
                    : "border-foreground bg-foreground"
                  : "border-muted-foreground"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium">Incorrect PIN</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              className="h-16 text-2xl font-bold rounded-xl"
              onPress={() => handleDigit(digit)}
              isDisabled={checking}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="h-16 rounded-xl"
            onPress={handleDelete}
            isDisabled={checking}
          >
            <BackspaceIcon className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl font-bold rounded-xl"
            onPress={() => handleDigit("0")}
            isDisabled={checking}
          >
            0
          </Button>
          <Button
            className="h-16 rounded-xl font-bold"
            onPress={handleSubmit}
            isDisabled={pin.length < 4 || checking}
          >
            {checking ? "..." : "OK"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
