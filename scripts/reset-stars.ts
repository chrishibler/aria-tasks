/**
 * Reset earned + spent stars for all profiles.
 * Deletes every doc in `completions` and `redemptions`.
 *
 * Dry run (counts only):  npx tsx scripts/reset-stars.ts
 * Execute:                npx tsx scripts/reset-stars.ts --confirm
 *
 * A JSON backup of every deleted doc is written to --backup <path> before deletion.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { writeFileSync } from "node:fs";
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

const confirm = process.argv.includes("--confirm");
const backupIdx = process.argv.indexOf("--backup");
const backupPath = backupIdx !== -1 ? process.argv[backupIdx + 1] : null;

const COLLECTIONS = ["completions", "redemptions"] as const;

async function main() {
  console.log(`Project: ${firebaseConfig.projectId}`);
  console.log(confirm ? "Mode: DELETE\n" : "Mode: dry run (no writes)\n");

  const backup: Record<string, unknown[]> = {};

  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, name));
    backup[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`${name}: ${snap.size} doc(s)`);

    if (!confirm) continue;

    // writeBatch caps at 500 ops
    for (let i = 0; i < snap.docs.length; i += 500) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    console.log(`  deleted ${snap.size}`);
  }

  if (backupPath) {
    writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`\nBackup written to ${backupPath}`);
  }

  console.log(confirm ? "\nDone." : "\nDry run only — re-run with --confirm to delete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
