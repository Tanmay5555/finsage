"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes with error callback
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase auth state listener error:", error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "varshneytanmay75@gmail.com,admin@finsage.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isAdmin = Boolean(
    user &&
    user.email &&
    (adminEmails.includes(user.email.toLowerCase()) || user.email.toLowerCase().endsWith("@admin.com"))
  );

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);