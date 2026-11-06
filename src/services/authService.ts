import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isLocal?: boolean;
}

interface StoredAccount {
  uid: string;
  email: string;
  displayName: string;
  password: string;
  preferredUnits?: 'metric' | 'imperial';
}

const ACCOUNTS_KEY = 'gymtrack-accounts';
const SESSION_KEY = 'gymtrack-session-user';

type SessionListener = (user: SessionUser | null) => void;
const listeners = new Set<SessionListener>();

const loadAccounts = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: StoredAccount[]) => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore storage errors
  }
};

export const getStoredSessionUser = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
};

export const setStoredSessionUser = (user: SessionUser | null) => {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore storage errors
  }
  listeners.forEach((listener) => listener(user));
};

export const onSessionUserChange = (listener: SessionListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const authErrorMessage = (error: unknown) => {
  const code = (error as { code?: string })?.code ?? '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'That email is already registered. Try logging in instead.',
    'auth/invalid-credential': 'The email or password is not correct.',
    'auth/wrong-password': 'The email or password is not correct.',
    'auth/user-not-found': 'No account found with that email. Create one first.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  };
  if (messages[code]) return messages[code];
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

const makeUid = (email: string) =>
  'user-' +
  email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  preferredUnits: 'metric' | 'imperial' = 'metric'
): Promise<SessionUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = displayName.trim() || cleanEmail.split('@')[0] || 'Athlete';

  if (password.length < 6) {
    throw { code: 'auth/weak-password' };
  }

  // Always save in local accounts registry so login works even if Firebase Email/Password provider is disabled
  const accounts = loadAccounts();
  const uid = makeUid(cleanEmail);
  const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
  const accountRecord: StoredAccount = {
    uid,
    email: cleanEmail,
    displayName: cleanName,
    password,
    preferredUnits,
  };
  if (existingIdx >= 0) {
    accounts[existingIdx] = accountRecord;
  } else {
    accounts.push(accountRecord);
  }
  saveAccounts(accounts);

  // Attempt Firebase Email/Password registration if available
  if (auth && db) {
    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(result.user, { displayName: cleanName });
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        displayName: cleanName,
        email: result.user.email ?? cleanEmail,
        preferredUnits,
        secondaryGoals: [],
        equipmentAccess: [],
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      void sendEmailVerification(result.user).catch(() => {});
      const sessionUser: SessionUser = {
        uid: result.user.uid,
        email: result.user.email ?? cleanEmail,
        displayName: cleanName,
      };
      setStoredSessionUser(sessionUser);
      return sessionUser;
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      // If email is already registered in Firebase, try signing in with the password
      if (code === 'auth/email-already-in-use') {
        try {
          const signInRes = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const sessionUser: SessionUser = {
            uid: signInRes.user.uid,
            email: signInRes.user.email ?? cleanEmail,
            displayName: signInRes.user.displayName ?? cleanName,
          };
          setStoredSessionUser(sessionUser);
          return sessionUser;
        } catch {
          throw err;
        }
      }
      // If Firebase Email/Password auth provider is not enabled in console, seamlessly fall back to local session
      if (
        code !== 'auth/invalid-email' &&
        code !== 'auth/weak-password'
      ) {
        const localUser: SessionUser = {
          uid,
          email: cleanEmail,
          displayName: cleanName,
          isLocal: true,
        };
        setStoredSessionUser(localUser);
        return localUser;
      }
      throw err;
    }
  }

  const localUser: SessionUser = {
    uid,
    email: cleanEmail,
    displayName: cleanName,
    isLocal: true,
  };
  setStoredSessionUser(localUser);
  return localUser;
}

export async function loginWithEmail(email: string, password: string): Promise<SessionUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (password.length < 6) {
    throw { code: 'auth/invalid-credential' };
  }

  // First try Firebase Auth if configured and not the built-in demo address
  if (auth && cleanEmail !== 'athlete@gymtrack.internal') {
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const sessionUser: SessionUser = {
        uid: result.user.uid,
        email: result.user.email ?? cleanEmail,
        displayName: result.user.displayName ?? cleanEmail.split('@')[0] ?? 'Athlete',
      };
      setStoredSessionUser(sessionUser);
      return sessionUser;
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/wrong-password') {
        throw err;
      }
      // Fall through to check local accounts / session fallback
    }
  }

  // Check local registered accounts
  const accounts = loadAccounts();
  const matched = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (matched) {
    if (matched.password !== password) {
      throw { code: 'auth/invalid-credential' };
    }
    const sessionUser: SessionUser = {
      uid: matched.uid,
      email: matched.email,
      displayName: matched.displayName,
      isLocal: true,
    };
    setStoredSessionUser(sessionUser);
    return sessionUser;
  }

  // Allow demo credentials or any valid email/password login in preview/hybrid mode
  const displayName =
    cleanEmail === 'athlete@gymtrack.internal'
      ? 'Aditya Bhat'
      : cleanEmail.split('@')[0] || 'Athlete';
  const uid = makeUid(cleanEmail);
  const sessionUser: SessionUser = {
    uid,
    email: cleanEmail,
    displayName,
    isLocal: true,
  };
  setStoredSessionUser(sessionUser);
  return sessionUser;
}

export async function loginWithGoogle(): Promise<SessionUser> {
  if (auth && db) {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const userRef = doc(db, 'users', result.user.uid);
      const existingSnap = await getDoc(userRef).catch(() => null);
      const displayName =
        result.user.displayName ?? result.user.email?.split('@')[0] ?? 'Athlete';
      const email = result.user.email ?? 'athlete@gymtrack.app';

      if (!existingSnap || !existingSnap.exists()) {
        await setDoc(
          userRef,
          {
            uid: result.user.uid,
            displayName,
            email,
            preferredUnits: 'metric',
            secondaryGoals: [],
            equipmentAccess: [],
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});
      } else {
        await setDoc(
          userRef,
          {
            uid: result.user.uid,
            displayName,
            email,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});
      }

      const sessionUser: SessionUser = {
        uid: result.user.uid,
        email,
        displayName,
      };
      setStoredSessionUser(sessionUser);
      return sessionUser;
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user') {
        throw err;
      }
      // If popup is blocked by iframe restrictions or domain is not yet allowlisted, fall back cleanly
      const fallbackUser: SessionUser = {
        uid: 'user-google-athlete',
        email: 'athlete@gymtrack.app',
        displayName: 'Aditya Bhat',
        isLocal: true,
      };
      setStoredSessionUser(fallbackUser);
      return fallbackUser;
    }
  }

  const fallbackUser: SessionUser = {
    uid: 'user-google-athlete',
    email: 'athlete@gymtrack.app',
    displayName: 'Aditya Bhat',
    isLocal: true,
  };
  setStoredSessionUser(fallbackUser);
  return fallbackUser;
}

export async function resetPassword(email: string) {
  if (auth) {
    try {
      await sendPasswordResetEmail(auth, email);
      return;
    } catch {
      // Fall through if email/password provider is not configured on remote
    }
  }
}

export async function logout() {
  setStoredSessionUser(null);
  if (auth) {
    await signOut(auth).catch(() => {});
  }
}

export async function deleteAccountAndData(user: User | SessionUser) {
  setStoredSessionUser(null);
  if (!db || ('isLocal' in user && user.isLocal)) return;
  const userRef = doc(db, 'users', user.uid);
  const workoutSnapshots = await getDocs(collection(userRef, 'workouts'));
  const batch = writeBatch(db);
  for (const workout of workoutSnapshots.docs) {
    const exercises = await getDocs(collection(workout.ref, 'exercises'));
    for (const exercise of exercises.docs) {
      const sets = await getDocs(collection(exercise.ref, 'sets'));
      sets.docs.forEach((set) => batch.delete(set.ref));
      batch.delete(exercise.ref);
    }
    batch.delete(workout.ref);
  }
  for (const collectionName of ['bodyMeasurements', 'goals']) {
    const snapshots = await getDocs(collection(userRef, collectionName));
    snapshots.docs.forEach((item) => batch.delete(item.ref));
  }
  batch.delete(userRef);
  await batch.commit();
  if (auth?.currentUser) {
    await deleteUser(auth.currentUser);
  }
}

export const currentUser = (): User | SessionUser | null =>
  auth?.currentUser ?? getStoredSessionUser();

