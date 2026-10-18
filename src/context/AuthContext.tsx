import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseConfigured } from '../services/firebase';
import { logout } from '../services/authService';

type AuthContextValue = { user: User | null; loading: boolean; configured: boolean; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  useEffect(() => { if (!auth) { setLoading(false); return; } return onAuthStateChanged(auth, (nextUser) => { setUser(nextUser); setLoading(false); }); }, []);
  const value = useMemo(() => ({ user, loading, configured: firebaseConfigured, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
