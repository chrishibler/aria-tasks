import { Timestamp } from "firebase/firestore";

// --- Profile ---

export const PROFILE_COLORS = [
  "rose",
  "sky",
  "violet",
  "amber",
  "emerald",
  "orange",
  "teal",
  "pink",
] as const;

export type ProfileColor = (typeof PROFILE_COLORS)[number];

export interface Profile {
  id: string;
  name: string;
  color: ProfileColor;
  avatarInitial: string;
  order: number;
  createdAt: Timestamp;
}

// --- Task ---

export type TimeSlot = "morning" | "afternoon" | "evening";
export type TaskType = "routine" | "chore";
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Task {
  id: string;
  profileId: string;
  name: string;
  illustration: string; // name of SVG in /public/illustrations
  type: TaskType;
  timeSlot: TimeSlot | null; // null for chores
  stars: number;
  repeatDays: DayOfWeek[];
  active: boolean; // when false, hidden from kids' view (completions kept)
  order: number;
  createdAt: Timestamp;
}

// --- Completion ---

export interface Completion {
  id: string;
  taskId: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  completedAt: Timestamp;
}

// --- Reward ---

export interface Reward {
  id: string;
  name: string;
  description: string;
  emoji?: string;
  starCost: number;
  profileIds: string[]; // which profiles can redeem
  renewable: boolean; // can be redeemed multiple times
  available: boolean;
  createdAt: Timestamp;
}

// --- Redemption ---

export interface Redemption {
  id: string;
  rewardId: string;
  rewardName: string;
  profileId: string;
  starCost: number;
  redeemedAt: Timestamp;
}

// --- Custom Lists ---

export interface CustomList {
  id: string;
  name: string;
  icon: string;
  createdAt: Timestamp;
  // Set when soft-deleted; null/absent means active. Soft-deleted lists keep
  // their items so a restore brings the whole list back intact.
  deletedAt?: Timestamp | null;
}

export interface ListItem {
  id: string;
  listId: string;
  text: string;
  checked: boolean;
  order: number;
  createdAt: Timestamp;
}

// --- Settings ---

export interface Settings {
  // The parent PIN is not stored: it rotates daily, see getRotatingPin().
  familyName: string;
}
