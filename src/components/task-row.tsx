"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check } from "lucide-react";
import { completeTask, uncompleteTask } from "@/lib/actions/tasks";
import { useConfirm } from "@/components/confirm-provider";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import { illustrationSrc, illustrationBg } from "@/lib/constants";
import { playSuccessSound } from "@/lib/sounds";
import type { Task, Completion, ProfileColor } from "@/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  completion?: Completion;
  profileColor: ProfileColor;
}

const colorCheckStyles: Record<ProfileColor, string> = {
  rose: "border-rose-400 bg-rose-400",
  sky: "border-sky-400 bg-sky-400",
  violet: "border-violet-400 bg-violet-400",
  amber: "border-amber-400 bg-amber-400",
  emerald: "border-emerald-400 bg-emerald-400",
  orange: "border-orange-400 bg-orange-400",
  teal: "border-teal-400 bg-teal-400",
  pink: "border-pink-400 bg-pink-400",
};

const colorUncheckedStyles: Record<ProfileColor, string> = {
  rose: "border-rose-300",
  sky: "border-sky-300",
  violet: "border-violet-300",
  amber: "border-amber-300",
  emerald: "border-emerald-300",
  orange: "border-orange-300",
  teal: "border-teal-300",
  pink: "border-pink-300",
};

const confettiColors: Record<ProfileColor, string[]> = {
  rose: ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3"],
  sky: ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd"],
  violet: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"],
  amber: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"],
  emerald: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
  orange: ["#f97316", "#fb923c", "#fdba74", "#fed7aa"],
  teal: ["#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
  pink: ["#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"],
};

const PIECE_COUNT = 22;

// A radial burst of confetti pieces flying outward in all directions. Random,
// so it's built once per burst rather than during render — re-rendering
// mid-animation would otherwise re-roll every piece and make the confetti jump.
function buildPieces(palette: string[]) {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = (i / PIECE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 70 + Math.random() * 90;
    return {
      id: i,
      color: palette[i % palette.length],
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 7 + Math.random() * 8,
      rounded: Math.random() > 0.5,
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.08,
      duration: 0.7 + Math.random() * 0.4,
    };
  });
}

function buildStars() {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 + 0.6;
    const distance = 55 + Math.random() * 70;
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      delay: 0.04 + i * 0.05,
    };
  });
}

function Celebration({ profileColor }: { profileColor: ProfileColor }) {
  const palette = confettiColors[profileColor];

  // Celebration remounts on each completion, so this re-rolls per burst.
  const [pieces] = useState(() => buildPieces(palette));
  const [stars] = useState(() => buildStars());

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {/* Expanding burst ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full border-4"
        style={{ borderColor: palette[0], translateX: "-50%", translateY: "-50%" }}
        initial={{ width: 20, height: 20, opacity: 0.8 }}
        animate={{ width: 180, height: 180, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Soft glow flash */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: palette[1] }}
        initial={{ opacity: 0.45 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Confetti pieces radiating from center */}
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.dx,
            y: p.dy,
            scale: [0, 1.2, 1, 0.4],
            opacity: [1, 1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, ease: "easeOut", delay: p.delay }}
        >
          <div
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.rounded ? "9999px" : "2px",
            }}
          />
        </motion.div>
      ))}

      {/* Stars shooting out */}
      {stars.map((s) => (
        <motion.div
          key={`star-${s.id}`}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: s.dx,
            y: s.dy,
            scale: [0, 1.6, 1, 0.5],
            opacity: [1, 1, 1, 0],
            rotate: 360,
          }}
          transition={{ duration: 0.85, ease: "easeOut", delay: s.delay }}
        >
          <Star className="h-5 w-5 fill-star text-star drop-shadow" />
        </motion.div>
      ))}
    </div>
  );
}

export function TaskCard({ task, completion, profileColor }: TaskCardProps) {
  const { dateString } = useDateNavigation();
  const confirm = useConfirm();
  const isCompleted = !!completion;
  const [animating, setAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleToggle = useCallback(async () => {
    if (isCompleted && completion) {
      const result = await uncompleteTask(completion.id, task.profileId, task.stars);
      if (!result.ok) {
        await confirm({
          title: "Those stars are already spent",
          description: `Un-checking "${task.name}" would take away ${task.stars} star${
            task.stars === 1 ? "" : "s"
          }, but ${result.shortfall} of them have already been spent on a reward. Ask a parent to sort it out.`,
          confirmLabel: "OK",
          destructive: false,
          showCancel: false,
        });
      }
    } else {
      setAnimating(true);
      setShowConfetti(true);
      playSuccessSound();
      await completeTask(task.id, task.profileId, dateString);
      setTimeout(() => setAnimating(false), 700);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }, [isCompleted, completion, task.id, task.profileId, task.stars, task.name, dateString, confirm]);

  return (
    <motion.button
      onClick={handleToggle}
      animate={
        animating
          ? { scale: [1, 1.06, 0.97, 1.02, 1], rotate: [0, 1.5, -1.5, 0.5, 0] }
          : {}
      }
      transition={{ duration: 0.7, ease: "easeInOut" }}
      // Single horizontal row: the illustration is a thumbnail beside the name
      // rather than a stacked banner above it, which is what made these tall.
      className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all"
      style={{
        backgroundColor: illustrationBg(task.illustration),
        zIndex: animating ? 20 : undefined,
      }}
    >
      {/* Celebration burst */}
      <AnimatePresence>
        {showConfetti && <Celebration profileColor={profileColor} />}
      </AnimatePresence>

      <motion.div
        className="shrink-0"
        animate={
          animating
            ? { scale: [1, 1.5, 0.85, 1.15, 1], rotate: [0, -16, 14, -6, 0] }
            : isCompleted
              ? { opacity: 0.5 }
              : { opacity: 1 }
        }
        transition={animating ? { duration: 0.7, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <Image
          src={illustrationSrc(task.illustration)}
          alt=""
          width={56}
          height={56}
          className="rounded-xl ring-1 ring-black/5"
        />
      </motion.div>

      <p
        className={cn(
          "min-w-0 flex-1 text-base font-semibold leading-snug line-clamp-2",
          isCompleted && "text-muted-foreground line-through opacity-60"
        )}
      >
        {task.name}
      </p>

      <motion.div
        className="flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 py-1 shadow-sm"
        animate={animating ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Star className={cn("h-4 w-4 text-star", isCompleted && "fill-star")} />
        <span className="text-sm font-bold">{task.stars}</span>
      </motion.div>

      <motion.div
        animate={animating ? { scale: [1, 1.7, 0.9, 1.2, 1] } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2.5px] bg-white/40 transition-all duration-200",
          isCompleted
            ? colorCheckStyles[profileColor]
            : colorUncheckedStyles[profileColor]
        )}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Check className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
