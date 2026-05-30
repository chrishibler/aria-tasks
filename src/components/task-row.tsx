"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import { completeTask, uncompleteTask } from "@/lib/actions/tasks";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
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

export function TaskCard({ task, completion, profileColor }: TaskCardProps) {
  const { dateString } = useDateNavigation();
  const isCompleted = !!completion;
  const [animating, setAnimating] = useState(false);

  async function handleToggle() {
    if (isCompleted && completion) {
      await uncompleteTask(completion.id);
    } else {
      setAnimating(true);
      await completeTask(task.id, task.profileId, dateString);
      setTimeout(() => setAnimating(false), 400);
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "flex w-full flex-col rounded-2xl bg-white text-left transition-all",
        isCompleted && "opacity-50"
      )}
    >
      {/* Top: large centered emoji */}
      <div className="flex items-center justify-center px-4 pt-5 pb-4">
        <span className="text-6xl leading-none">{task.emoji}</span>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-border/50" />

      {/* Bottom: name + stars on left, checkbox on right */}
      <div className="flex items-center px-4 pt-3 pb-4">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-semibold leading-tight",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.name}
          </p>
          <div className="mt-0.5 flex items-center gap-0.5 text-muted-foreground">
            <Star className="h-3 w-3" />
            <span className="text-xs">{task.stars}</span>
          </div>
        </div>

        <motion.div
          animate={animating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={cn(
            "ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2.5px] transition-all duration-200",
            isCompleted
              ? colorCheckStyles[profileColor]
              : colorUncheckedStyles[profileColor]
          )}
        >
          {isCompleted && (
            <Check className="h-4 w-4 text-white animate-check-in" />
          )}
        </motion.div>
      </div>
    </button>
  );
}
