import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  profilesCollection,
  tasksCollection,
  completionsCollection,
  rewardsCollection,
  listsCollection,
  listItemsCollection,
  settingsDoc,
} from "../collections";
import type { Settings, ProfileColor, TaskType, TimeSlot, DayOfWeek } from "@/types";

// --- Profiles ---

export async function createProfile(data: {
  name: string;
  color: ProfileColor;
  avatarInitial: string;
  order: number;
}) {
  await addDoc(profilesCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateProfile(
  id: string,
  data: Partial<{ name: string; color: ProfileColor; avatarInitial: string; order: number }>
) {
  await updateDoc(doc(db, "profiles", id), data);
}

export async function deleteProfile(id: string) {
  const batch = writeBatch(db);

  // Delete associated tasks
  const tasksSnap = await getDocs(query(tasksCollection, where("profileId", "==", id)));
  tasksSnap.docs.forEach((d) => batch.delete(d.ref));

  // Delete associated completions
  const completionsSnap = await getDocs(query(completionsCollection, where("profileId", "==", id)));
  completionsSnap.docs.forEach((d) => batch.delete(d.ref));

  batch.delete(doc(db, "profiles", id));
  await batch.commit();
}

// --- Tasks ---

export async function createTask(data: {
  profileId: string;
  name: string;
  emoji: string;
  type: TaskType;
  timeSlot: TimeSlot | null;
  stars: number;
  repeatDays: DayOfWeek[];
  order: number;
}) {
  await addDoc(tasksCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateTask(
  id: string,
  data: Partial<{
    name: string;
    emoji: string;
    type: TaskType;
    timeSlot: TimeSlot | null;
    stars: number;
    repeatDays: DayOfWeek[];
    order: number;
    profileId: string;
  }>
) {
  await updateDoc(doc(db, "tasks", id), data);
}

export async function deleteTask(id: string) {
  const batch = writeBatch(db);

  const completionsSnap = await getDocs(query(completionsCollection, where("taskId", "==", id)));
  completionsSnap.docs.forEach((d) => batch.delete(d.ref));

  batch.delete(doc(db, "tasks", id));
  await batch.commit();
}

// --- Rewards ---

export async function createReward(data: {
  name: string;
  description: string;
  emoji?: string;
  starCost: number;
  profileIds: string[];
  renewable: boolean;
  available: boolean;
}) {
  await addDoc(rewardsCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateReward(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    emoji: string;
    starCost: number;
    profileIds: string[];
    renewable: boolean;
    available: boolean;
  }>
) {
  await updateDoc(doc(db, "rewards", id), data);
}

export async function deleteReward(id: string) {
  await deleteDoc(doc(db, "rewards", id));
}

// --- Custom Lists ---

export async function createCustomList(data: { name: string; icon: string }) {
  await addDoc(listsCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateCustomList(id: string, data: Partial<{ name: string; icon: string }>) {
  await updateDoc(doc(db, "lists", id), data);
}

export async function deleteCustomList(id: string) {
  const batch = writeBatch(db);

  const itemsSnap = await getDocs(query(listItemsCollection, where("listId", "==", id)));
  itemsSnap.docs.forEach((d) => batch.delete(d.ref));

  batch.delete(doc(db, "lists", id));
  await batch.commit();
}

// --- List Items ---

export async function createListItem(data: { listId: string; text: string; order: number }) {
  await addDoc(listItemsCollection, {
    ...data,
    checked: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateListItem(
  id: string,
  data: Partial<{ text: string; checked: boolean; order: number }>
) {
  await updateDoc(doc(db, "listItems", id), data);
}

export async function deleteListItem(id: string) {
  await deleteDoc(doc(db, "listItems", id));
}

// --- Settings ---

export async function updateSettings(data: Partial<Settings>) {
  await setDoc(settingsDoc, data, { merge: true });
}
