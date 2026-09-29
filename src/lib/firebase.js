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

if (getApps().length > 0) {
  app = getApp();
} else if (hasValidKey) {
  app = initializeApp(firebaseConfig);
} else {
  // Safe fallback initialization to prevent page crashes if environment variables are initializing
  app = initializeApp({
    apiKey: firebaseConfig.apiKey || "mock-api-key-for-next-build",
    authDomain: firebaseConfig.authDomain || "mock-auth-domain",
    projectId: firebaseConfig.projectId || "mock-project-id",
    storageBucket: firebaseConfig.storageBucket || "mock-storage-bucket",
    messagingSenderId: firebaseConfig.messagingSenderId || "mock-messaging-sender-id",
    appId: firebaseConfig.appId || "mock-app-id"
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

