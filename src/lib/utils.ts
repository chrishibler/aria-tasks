import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TIME_SLOTS } from "./constants";
import type { DayOfWeek, TimeSlot } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= TIME_SLOTS.morning.start && hour < TIME_SLOTS.morning.end) return "morning";
  if (hour >= TIME_SLOTS.afternoon.start && hour < TIME_SLOTS.afternoon.end) return "afternoon";
  return "evening";
}

export function getTodayDateString(): string {
  const now = new Date();
  return getDateString(now);
}

export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getProfileInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function getGreeting(timeSlot: TimeSlot): string {
  return TIME_SLOTS[timeSlot].greeting;
}
