import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firestore's default streaming transport hangs behind the iOS/iPadOS Screen
// Time web content filter ("Limit Adult Websites"): the filter buffers the
// long-lived response, so onSnapshot listeners never receive a first snapshot
// and the UI sits on skeletons forever. The SDK's auto-detection doesn't catch
// this case. Forcing long polling uses plain request/response round trips,
// which the filter passes through, at the cost of slightly higher latency.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
