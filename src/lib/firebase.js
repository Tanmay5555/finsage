import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const sanitize = (val) => {
  if (!val) return "";
  return String(val).replace(/^["']|["']$/g, "").trim();
};

const apiKey = sanitize(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || "AIzaSyCk1VF-W42LcKdxNbmT37W8R3VfOJ__AuE";
const authDomain = sanitize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "finsage-cbad7.firebaseapp.com";
const projectId = sanitize(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "finsage-cbad7";
const storageBucket = sanitize(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "finsage-cbad7.firebasestorage.app";
const messagingSenderId = sanitize(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID) || "732385274911";
const appId = sanitize(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || "1:732385274911:web:44fe5d39533e032a0af92a";
const measurementId = sanitize(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) || "G-3H7H9DR5JY";

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId
};

// Singleton App Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;