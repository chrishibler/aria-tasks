import { addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { completionsCollection } from "../collections";
import { db } from "../firebase";

export async function completeTask(taskId: string, profileId: string, date: string) {
  await addDoc(completionsCollection, {
    taskId,
    profileId,
    date,
    completedAt: serverTimestamp(),
  });
}

export async function uncompleteTask(completionId: string) {
  await deleteDoc(doc(db, "completions", completionId));
}
