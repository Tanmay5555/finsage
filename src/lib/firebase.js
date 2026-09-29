import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const sanitize = (val) => (typeof val === "string" ? val.replace(/^["']|["']$/g, "").trim() : "");

const firebaseConfig = {
  apiKey: sanitize(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitize(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID),
  appId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

const hasValidKey = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "undefined" &&
  !firebaseConfig.apiKey.includes("mock")
);

let app;

if (hasValidKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else if (typeof window !== "undefined") {
  console.warn("⚠️ NEXT_PUBLIC_FIREBASE_API_KEY appears to be missing or invalid in browser runtime.", {
    hasKey: Boolean(firebaseConfig.apiKey),
    projectId: firebaseConfig.projectId
  });
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else {
  // Build-time SSR static generation dummy fallback
  app = getApps().length === 0 ? initializeApp({
    apiKey: "mock-api-key-for-next-build",
    authDomain: "mock-auth-domain",
    projectId: "mock-project-id",
    storageBucket: "mock-storage-bucket",
    messagingSenderId: "mock-messaging-sender-id",
    appId: "mock-app-id"
  }) : getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
