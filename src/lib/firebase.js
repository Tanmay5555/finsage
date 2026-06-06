import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Import getApps and getApp dynamically or import at the top
import { getApps, getApp } from "firebase/app";

let app;
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else {
  // Provide fallback config during next build to prevent compiler crashes
  app = initializeApp({
    apiKey: "mock-api-key-for-next-build",
    authDomain: "mock-auth-domain",
    projectId: "mock-project-id",
    storageBucket: "mock-storage-bucket",
    messagingSenderId: "mock-messaging-sender-id",
    appId: "mock-app-id"
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);