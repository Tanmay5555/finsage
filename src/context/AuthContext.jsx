// src/context/AuthContext.tsx 

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState } from

"react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Define the shape of our AuthContext





// Create context with default values
const AuthContext = createContext({
  user: null,
  loading: true
});

// AuthProvider component to wrap around the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>);

};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);