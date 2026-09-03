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
    familyName: "Our Family",
  });
  console.log("Settings created (PIN rotates daily: DDMM)");

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
    { name: "Brush teeth", illustration: "brush-teeth", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 0 },
    { name: "Wash hands", illustration: "wash-hands", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 1 },
    { name: "Make bed", illustration: "make-bed", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 2 },
    { name: "Pack lunch", illustration: "pack-lunch", type: "routine", timeSlot: "morning", stars: 2, repeatDays: WEEKDAYS, order: 3 },
    // Afternoon routines
    { name: "Unpack backpack", illustration: "unpack-backpack", type: "routine", timeSlot: "afternoon", stars: 2, repeatDays: WEEKDAYS, order: 4 },
    { name: "Feed pet", illustration: "feed-pet", type: "routine", timeSlot: "afternoon", stars: 2, repeatDays: ALL_DAYS, order: 5 },
    { name: "Set the table", illustration: "set-the-table", type: "routine", timeSlot: "afternoon", stars: 2, repeatDays: ALL_DAYS, order: 6 },
    // Evening routines
    { name: "Shower", illustration: "shower", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 7 },
    { name: "Brush teeth", illustration: "brush-teeth", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 8 },
    { name: "Put away toys", illustration: "put-away-toys", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 9 },
    // Dailies
    { name: "Clean room", illustration: "clean-room", type: "daily", timeSlot: null, stars: 3, repeatDays: ALL_DAYS, order: 10 },
    { name: "Water plants", illustration: "water-plants", type: "daily", timeSlot: null, stars: 2, repeatDays: ["mon", "thu"], order: 11 },
    { name: "Take out trash", illustration: "take-out-trash", type: "daily", timeSlot: null, stars: 2, repeatDays: ["mon", "thu"], order: 12 },
  ];

  for (const task of ariaTasks) {
    await addDoc(collection(db, "tasks"), {
      ...task,
      active: true,
      profileId: profileIds[0],
      createdAt: serverTimestamp(),
    });
  }
  console.log(`  ${ariaTasks.length} tasks added for Aria`);

  // Tasks for Leo
  const leoTasks = [
    { name: "Brush teeth", illustration: "brush-teeth", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 0 },
    { name: "Wash hands", illustration: "wash-hands", type: "routine", timeSlot: "morning", stars: 1, repeatDays: ALL_DAYS, order: 1 },
    { name: "Put away toys", illustration: "put-away-toys", type: "routine", timeSlot: "afternoon", stars: 1, repeatDays: ALL_DAYS, order: 2 },
    { name: "Feed pet", illustration: "feed-pet", type: "routine", timeSlot: "afternoon", stars: 1, repeatDays: ALL_DAYS, order: 3 },
    { name: "Shower", illustration: "shower", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 4 },
    { name: "Brush teeth", illustration: "brush-teeth", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 5 },
    { name: "Put away toys", illustration: "put-away-toys", type: "routine", timeSlot: "evening", stars: 1, repeatDays: ALL_DAYS, order: 6 },
    { name: "Sweep floor", illustration: "sweep-floor", type: "daily", timeSlot: null, stars: 2, repeatDays: ALL_DAYS, order: 7 },
  ];

  for (const task of leoTasks) {
    await addDoc(collection(db, "tasks"), {
      ...task,
      active: true,
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
