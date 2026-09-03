import type { DayOfWeek, TimeSlot } from "@/types";

export const TIME_SLOTS: Record<
  TimeSlot,
  { start: number; end: number; label: string; greeting: string }
> = {
  // Between them these cover the whole day: midnight-11 morning, 11-15
  // afternoon, 15-midnight evening. `end` is exclusive.
  morning: { start: 0, end: 11, label: "Morning", greeting: "Good morning" },
  afternoon: { start: 11, end: 15, label: "Afternoon", greeting: "Good afternoon" },
  evening: { start: 15, end: 24, label: "Evening", greeting: "Good evening" },
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

// Task illustrations: SVG files in /public/illustrations/<name>.svg
export const TASK_ILLUSTRATIONS: { name: string; label: string }[] = [
  { name: "brush-teeth", label: "Brush teeth" },
  { name: "wash-hands", label: "Wash hands" },
  { name: "brush-hair", label: "Brush hair" },
  { name: "get-dressed", label: "Get dressed" },
  { name: "shower", label: "Shower" },
  { name: "make-bed", label: "Make bed" },
  { name: "put-away-toys", label: "Put away toys" },
  { name: "clean-room", label: "Clean room" },
  { name: "pack-lunch", label: "Pack lunch" },
  { name: "unpack-backpack", label: "Unpack backpack" },
  { name: "set-the-table", label: "Set the table" },
  { name: "wipe-the-table", label: "Wipe the table" },
  { name: "load-dishwasher", label: "Load dishwasher" },
  { name: "put-dishes-away", label: "Put dishes away" },
  { name: "clean-the-sink", label: "Clean the sink" },
  { name: "wipe-counters", label: "Wipe counters" },
  { name: "wipe-mirrors", label: "Wipe mirrors" },
  { name: "do-laundry", label: "Do laundry" },
  { name: "fold-clothes", label: "Fold clothes" },
  { name: "feed-pet", label: "Feed pet" },
  { name: "walk-the-dog", label: "Walk the dog" },
  { name: "water-plants", label: "Water plants" },
  { name: "sweep-floor", label: "Sweep floor" },
  { name: "vacuum", label: "Vacuum" },
  { name: "take-out-trash", label: "Take out trash" },
  { name: "rake-leaves", label: "Rake leaves" },
  { name: "vitamins", label: "Vitamins" },
  { name: "breakfast", label: "Breakfast" },
  { name: "snack", label: "Snack" },
  { name: "water-bottle", label: "Water bottle" },
  { name: "floss", label: "Floss" },
  { name: "read", label: "Read" },
  { name: "sign-papers", label: "Sign papers" },
  { name: "reminder", label: "Reminder" },
  { name: "helping", label: "Helping" },
  { name: "kindness", label: "Kindness" },
];

export const ILLUSTRATION_NAMES = new Set(TASK_ILLUSTRATIONS.map((i) => i.name));

export const DEFAULT_ILLUSTRATION = "brush-teeth";

// Background color of each illustration's SVG, so the card's top section can
// extend the same color seamlessly behind the artwork.
export const ILLUSTRATION_BG: Record<string, string> = {
  "brush-teeth": "#eef4fd",
  "do-laundry": "#eef4fd",
  "put-away-toys": "#eef4fd",
  "put-dishes-away": "#eef4fd",
  "wipe-the-table": "#eef4fd",
  "sign-papers": "#eef4fd",
  "water-bottle": "#eef4fd",
  "brush-hair": "#fdeee8",
  "clean-room": "#fdeee8",
  "clean-the-sink": "#fdeee8",
  "fold-clothes": "#fdeee8",
  "take-out-trash": "#fdeee8",
  vitamins: "#fdeee8",
  kindness: "#fdeee8",
  "feed-pet": "#f4eefb",
  "get-dressed": "#f4eefb",
  shower: "#f4eefb",
  "sweep-floor": "#f4eefb",
  "wipe-mirrors": "#f4eefb",
  floss: "#f4eefb",
  helping: "#f4eefb",
  "load-dishwasher": "#fdf8e8",
  "make-bed": "#fdf8e8",
  "rake-leaves": "#fdf8e8",
  "walk-the-dog": "#fdf8e8",
  "wipe-counters": "#fdf8e8",
  breakfast: "#fdf8e8",
  reminder: "#fdf8e8",
  "pack-lunch": "#eef8f2",
  "set-the-table": "#eef8f2",
  vacuum: "#eef8f2",
  "wash-hands": "#eef8f2",
  "water-plants": "#eef8f2",
  snack: "#eef8f2",
  "unpack-backpack": "#fdf6ee",
  read: "#fdf6ee",
};

export function illustrationSrc(name: string): string {
  const safe = ILLUSTRATION_NAMES.has(name) ? name : DEFAULT_ILLUSTRATION;
  return `/illustrations/${safe}.svg`;
}

// Slightly darker shade of each illustration's background, for the lower
// (text + checkbox) section of the task card.
export const ILLUSTRATION_BG_DARK: Record<string, string> = {
  "#eef4fd": "#dbe8fb", // blue
  "#fdeee8": "#fadcd0", // peach
  "#f4eefb": "#e8ddf7", // purple
  "#fdf8e8": "#faf0d0", // yellow
  "#eef8f2": "#daf0e4", // green
  "#fdf6ee": "#faebd8", // orange
};

export function illustrationBg(name: string): string {
  return ILLUSTRATION_BG[name] ?? ILLUSTRATION_BG[DEFAULT_ILLUSTRATION];
}

export function illustrationBgDark(name: string): string {
  const base = illustrationBg(name);
  return ILLUSTRATION_BG_DARK[base] ?? base;
}

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

/**
 * The parent PIN rotates daily: two-digit day followed by two-digit month,
 * so 2 September is "0209". Derived from the device's local date so it matches
 * the calendar the parent is reading it off.
 */
export function getRotatingPin(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}${month}`;
}
export const DEFAULT_FAMILY_NAME = "Our Family";

// Curated icons offered when creating or renaming a custom list. Any emoji can
// still be typed by hand in the "custom" field.
export const LIST_ICONS = [
  "📝", "✅", "🛒", "🧺", "🎒", "🍎", "🥕", "🍕",
  "☕", "🎂", "🧹", "🧼", "🛁", "🐶", "🐱", "🌱",
  "🎁", "🎈", "🎄", "✈️", "🏖️", "🚗", "🏠", "📚",
  "🎨", "🎵", "🎬", "⚽", "🧸", "💊", "🔧", "⭐",
];

export const DEFAULT_LIST_ICON = "📝";

/**
 * Some older lists store a lucide icon name ("star", "sun") rather than an
 * emoji, which would otherwise render as literal text in the icon slot. Fall
 * back to the default so the row still looks right; re-picking an icon in the
 * list dialog replaces the stale value.
 */
export function listIcon(icon: string | undefined): string {
  return icon && /\p{Extended_Pictographic}/u.test(icon) ? icon : DEFAULT_LIST_ICON;
}
