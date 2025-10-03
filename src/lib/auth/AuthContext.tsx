"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { FbAuth } from "@/lib/firebase";

type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: UserInfo | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!FbAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      FbAuth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          // Firebase認証成功後、データベースにユーザーを登録/更新
          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                username: firebaseUser.displayName,
                iconUrl: firebaseUser.photoURL,
              }),
            });

            if (!response.ok) {
              console.error(
                "Failed to register user in database:",
                await response.text()
              );
            }
          } catch (error) {
            console.error("Error registering user:", error);
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      if (FbAuth) {
        await FbAuth.signOut();
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
