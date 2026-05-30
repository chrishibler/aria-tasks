/**
 * Seed script for Aria Tasks (Skylight Calendar clone)
 * Run with: npx tsx scripts/seed.ts
 *
 * Requires .env.local to have Firebase config set.
 * Install tsx first: npm install -D tsx
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { config } from "dotenv";

config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"];

async function seed() {
  console.log("Seeding Aria Tasks (Skylight Calendar)...\n");

  // Settings
  await setDoc(doc(db, "settings", "main"), {
    pin: "1234",
    familyName: "Our Family",
  });
  console.log("Settings created (PIN: 1234)");

  // Profiles
  const profiles = [
    { name: "Aria", color: "rose", avatarInitial: "A", order: 0 },
    { name: "Leo", color: "sky", avatarInitial: "L", order: 1 },
  ];

  const profileIds: string[] = [];
  for (const profile of profiles) {
    const ref = await addDoc(collection(db, "profiles"), {
      ...profile,
      createdAt: serverTimestamp(),
    });
    profileIds.push(ref.id);
    console.log(`Profile: ${profile.name} (${ref.id})`);
  }

  // Tasks for Aria
  const ariaTasks = [
    // Morning routines
    { name: "Brush teeth", emoji: "🪥", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 0 },
    { name: "Get dressed", emoji: "👕", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 1 },
    { name: "Make bed", emoji: "🛏️", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 2 },
    { name: "Pack backpack", emoji: "🎒", type: "routine", timeSlot: "morning", stars: 2, repeatDays: WEEKDAYS, order: 3 },
    // Afternoon routines
    { name: "Homework", emoji: "✏️", type: "routine", timeSlot: "afternoon", stars: 3, repeatDays: WEEKDAYS, order: 4 },
    { name: "Reading", emoji: "📚", type: "routine", timeSlot: "afternoon", stars: 2, repeatDays: ALL_DAYS, order: 5 },
    { name: "Practice music", emoji: "🎵", type: "routine", timeSlot: "afternoon", stars: 2, repeatDays: WEEKDAYS, order: 6 },
    // Evening routines
    { name: "Bath time", emoji: "🛁", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 7 },
    { name: "Brush teeth", emoji: "🪥", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 8 },
    { name: "Bedtime", emoji: "💤", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 9 },
    // Chores
    { name: "Tidy room", emoji: "🧸", type: "chore", timeSlot: null, stars: 3, repeatDays: ALL_DAYS, order: 10 },
    { name: "Set table", emoji: "🍽️", type: "chore", timeSlot: null, stars: 2, repeatDays: ALL_DAYS, order: 11 },
    { name: "Water plants", emoji: "🌱", type: "chore", timeSlot: null, stars: 2, repeatDays: ["mon", "thu"], order: 12 },
  ];

  for (const task of ariaTasks) {
    await addDoc(collection(db, "tasks"), {
      ...task,
      profileId: profileIds[0],
      createdAt: serverTimestamp(),
    });
  }
  console.log(`  ${ariaTasks.length} tasks added for Aria`);

  // Tasks for Leo
  const leoTasks = [
    { name: "Brush teeth", emoji: "🪥", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 0 },
    { name: "Get dressed", emoji: "👕", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 1 },
    { name: "Shoes away", emoji: "👟", type: "routine", timeSlot: "afternoon", stars: 1, repeatDays: ALL_DAYS, order: 2 },
    { name: "Drink water", emoji: "🥤", type: "routine", timeSlot: "afternoon", stars: 1, repeatDays: ALL_DAYS, order: 3 },
    { name: "Bath time", emoji: "🛁", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 4 },
    { name: "Brush teeth", emoji: "🪥", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 5 },
    { name: "Bedtime", emoji: "💤", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 6 },
    { name: "Clean up toys", emoji: "🧹", type: "chore", timeSlot: null, stars: 2, repeatDays: ALL_DAYS, order: 7 },
  ];

  for (const task of leoTasks) {
    await addDoc(collection(db, "tasks"), {
      ...task,
      profileId: profileIds[1],
      createdAt: serverTimestamp(),
    });
  }
  console.log(`  ${leoTasks.length} tasks added for Leo`);

  // Rewards (available to all profiles)
  const rewards = [
    { name: "30 min iPad time", description: "Play games or watch videos", emoji: "🎮", starCost: 15, profileIds: [], renewable: true, available: true },
    { name: "Ice cream treat", description: "Pick any flavor!", emoji: "🍦", starCost: 25, profileIds: [], renewable: true, available: true },
    { name: "Movie night pick", description: "You get to choose the movie!", emoji: "🎬", starCost: 40, profileIds: [], renewable: true, available: true },
    { name: "New stickers", description: "A pack of fun stickers", emoji: "⭐", starCost: 50, profileIds: [], renewable: true, available: true },
    { name: "Trip to the park", description: "Extra playground time!", emoji: "🏞️", starCost: 30, profileIds: [], renewable: true, available: true },
    { name: "Stay up 30 min late", description: "Extra time before bed", emoji: "🌙", starCost: 35, profileIds: [], renewable: true, available: true },
  ];

  for (const reward of rewards) {
    await addDoc(collection(db, "rewards"), {
      ...reward,
      createdAt: serverTimestamp(),
    });
  }
  console.log(`\n${rewards.length} rewards created`);

  console.log("\nDone! Your database is ready.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
