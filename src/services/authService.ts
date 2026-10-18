import { createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export const authErrorMessage = (error: unknown) => {
  const code = (error as { code?: string })?.code ?? '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'That email is already registered. Try logging in instead.',
    'auth/invalid-credential': 'The email or password is not correct.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  };
  return messages[code] ?? 'Something went wrong. Please try again.';
};

const ensureAuth = () => { if (!auth || !db) throw new Error('Firebase is not configured.'); return { auth, db }; };

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const { auth: firebaseAuth, db: firestore } = ensureAuth();
  const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(result.user, { displayName });
  await setDoc(doc(firestore, 'users', result.user.uid), { uid: result.user.uid, displayName, email: result.user.email, preferredUnits: 'metric', secondaryGoals: [], equipmentAccess: [], onboardingCompleted: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  await sendEmailVerification(result.user);
  return result.user;
}

export async function loginWithEmail(email: string, password: string) { const { auth: firebaseAuth } = ensureAuth(); const result = await signInWithEmailAndPassword(firebaseAuth, email, password); return result.user; }
export async function loginWithGoogle() { const { auth: firebaseAuth, db: firestore } = ensureAuth(); const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); await setDoc(doc(firestore, 'users', result.user.uid), { uid: result.user.uid, displayName: result.user.displayName ?? result.user.email?.split('@')[0] ?? 'Athlete', email: result.user.email ?? '', preferredUnits: 'metric', secondaryGoals: [], equipmentAccess: [], onboardingCompleted: false, updatedAt: serverTimestamp() }, { merge: true }); return result.user; }
export async function resetPassword(email: string) { const { auth: firebaseAuth } = ensureAuth(); await sendPasswordResetEmail(firebaseAuth, email); }
export async function logout() { if (auth) await signOut(auth); }
export const currentUser = (): User | null => auth?.currentUser ?? null;
