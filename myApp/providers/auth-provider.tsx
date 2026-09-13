import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { auth, isFirebaseConfigured } from '@/lib/firebase';

type AuthContextValue = {
  configured: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoaded(true);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isFirebaseConfigured,
    isLoaded,
    isSignedIn: Boolean(user),
    user,
    getToken: async () => user?.getIdToken() ?? null,
    signOut: async () => {
      if (auth) await firebaseSignOut(auth);
    },
  }), [isLoaded, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
