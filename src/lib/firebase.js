import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const sanitize = (val) => (typeof val === "string" ? val.replace(/^["']|["']$/g, "").trim() : "");

const firebaseConfig = {
  apiKey: sanitize(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || "AIzaSyCk1VF-W42LcKdxNbmT37W8R3VfOJ__AuE",
  authDomain: sanitize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "finsage-cbad7.firebaseapp.com",
  projectId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "finsage-cbad7",
  storageBucket: sanitize(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "finsage-cbad7.firebasestorage.app",
  messagingSenderId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID) || "732385274911",
  appId: sanitize(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || "1:732385274911:web:44fe5d39533e032a0af92a"
};

let app;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


