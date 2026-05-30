import type { DayOfWeek, TimeSlot } from "@/types";

export const TIME_SLOTS: Record<
  TimeSlot,
  { start: number; end: number; label: string; greeting: string }
> = {
  morning: { start: 6, end: 12, label: "Morning", greeting: "Good morning" },
  afternoon: { start: 12, end: 17, label: "Afternoon", greeting: "Good afternoon" },
  evening: { start: 17, end: 22, label: "Evening", greeting: "Good evening" },
};

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: "mon", label: "Monday", short: "M" },
  { value: "tue", label: "Tuesday", short: "T" },
  { value: "wed", label: "Wednesday", short: "W" },
  { value: "thu", label: "Thursday", short: "T" },
  { value: "fri", label: "Friday", short: "F" },
  { value: "sat", label: "Saturday", short: "S" },
  { value: "sun", label: "Sunday", short: "S" },
];

export const ALL_DAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const TASK_EMOJIS: { emoji: string; label: string }[] = [
  { emoji: "🪥", label: "Brush teeth" },
  { emoji: "🛁", label: "Bath" },
  { emoji: "👕", label: "Get dressed" },
  { emoji: "🛏️", label: "Make bed" },
  { emoji: "🎒", label: "Pack backpack" },
  { emoji: "📚", label: "Reading" },
  { emoji: "✏️", label: "Homework" },
  { emoji: "🍽️", label: "Set table" },
  { emoji: "🧹", label: "Clean up" },
  { emoji: "🐕", label: "Feed pet" },
  { emoji: "🌱", label: "Water plants" },
  { emoji: "👟", label: "Shoes away" },
  { emoji: "🧺", label: "Laundry" },
  { emoji: "🎵", label: "Practice music" },
  { emoji: "💊", label: "Take vitamins" },
  { emoji: "🥤", label: "Drink water" },
  { emoji: "🧘", label: "Mindfulness" },
  { emoji: "🚿", label: "Shower" },
  { emoji: "💤", label: "Bedtime" },
  { emoji: "🦷", label: "Floss" },
  { emoji: "📝", label: "Journal" },
  { emoji: "🎨", label: "Art" },
  { emoji: "🏃", label: "Exercise" },
  { emoji: "🧸", label: "Tidy room" },
  { emoji: "⭐", label: "Other" },
];

export const PROFILE_COLORS = {
  rose: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", hex: "#f43f5e" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300", hex: "#0ea5e9" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-300", hex: "#8b5cf6" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", hex: "#f59e0b" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", hex: "#10b981" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", hex: "#f97316" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300", hex: "#14b8a6" },
  pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300", hex: "#ec4899" },
} as const;

export const DEFAULT_PIN = "1234";
export const DEFAULT_FAMILY_NAME = "Our Family";
