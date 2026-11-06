import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseConfigured } from '../services/firebase';
import {
  getStoredSessionUser,
  logout,
  onSessionUserChange,
  setStoredSessionUser,
  type SessionUser,
} from '../services/authService';

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  configured: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredSessionUser());
  const [loading, setLoading] = useState(() => Boolean(firebaseConfigured && !getStoredSessionUser()));

  useEffect(() => {
    const unsubLocal = onSessionUserChange((nextSession) => {
      setUser(nextSession);
      setLoading(false);
    });

    if (!auth) {
      setLoading(false);
      return unsubLocal;
    }

    const unsubFirebase = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mapped: SessionUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        setStoredSessionUser(mapped);
        setUser(mapped);
      } else {
        const stored = getStoredSessionUser();
        if (stored?.isLocal) {
          setUser(stored);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubLocal();
      unsubFirebase();
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, configured: firebaseConfigured, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

