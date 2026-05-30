import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";

export const profilesCollection = collection(db, "profiles");
export const tasksCollection = collection(db, "tasks");
export const completionsCollection = collection(db, "completions");
export const rewardsCollection = collection(db, "rewards");
export const redemptionsCollection = collection(db, "redemptions");
export const listsCollection = collection(db, "lists");
export const listItemsCollection = collection(db, "listItems");
export const settingsDoc = doc(db, "settings", "main");
