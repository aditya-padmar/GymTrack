import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Exercise, Goal, GymData, Measurement, Profile, Workout } from '../types';

const requireDb = () => { if (!db) throw new Error('Firebase Firestore is not configured.'); return db; };

export async function loadUserData(uid: string, fallback: GymData): Promise<GymData> {
  const firestore = requireDb();
  const profileSnapshot = await getDoc(doc(firestore, 'users', uid));
  const profile = (profileSnapshot.data() as Profile | undefined) ?? fallback.profile;
  const workoutSnapshots = await getDocs(query(collection(firestore, 'users', uid, 'workouts'), orderBy('workoutDate', 'desc')));
  const workouts: Workout[] = [];
  for (const workoutSnapshot of workoutSnapshots.docs) {
    const workout = workoutSnapshot.data() as Omit<Workout, 'id' | 'exercises'>;
    const exerciseSnapshots = await getDocs(query(collection(workoutSnapshot.ref, 'exercises'), orderBy('order', 'asc')));
    const exercises: Exercise[] = [];
    for (const exerciseSnapshot of exerciseSnapshots.docs) {
      const exercise = exerciseSnapshot.data() as Omit<Exercise, 'id' | 'sets'>;
      const setSnapshots = await getDocs(query(collection(exerciseSnapshot.ref, 'sets'), orderBy('setNumber', 'asc')));
      exercises.push({ ...exercise, id: exerciseSnapshot.id, sets: setSnapshots.docs.map((set) => ({ ...set.data(), id: set.id } as Exercise['sets'][number])) });
    }
    workouts.push({ ...workout, id: workoutSnapshot.id, exercises });
  }
  const measurementSnapshots = await getDocs(query(collection(firestore, 'users', uid, 'bodyMeasurements'), orderBy('recordedAt', 'desc')));
  const goalSnapshots = await getDocs(collection(firestore, 'users', uid, 'goals'));
  return { profile, workouts, measurements: measurementSnapshots.docs.map((item) => ({ ...item.data(), id: item.id } as Measurement)), goals: goalSnapshots.docs.map((item) => ({ ...item.data(), id: item.id } as Goal)), source: 'firestore' };
}

export async function saveProfile(uid: string, profile: Partial<Profile>) { const firestore = requireDb(); await setDoc(doc(firestore, 'users', uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true }); }
export async function saveMeasurement(uid: string, measurement: Measurement) { const firestore = requireDb(); await setDoc(doc(firestore, 'users', uid, 'bodyMeasurements', measurement.id), measurement); }
export async function deleteMeasurement(uid: string, id: string) { const firestore = requireDb(); await deleteDoc(doc(firestore, 'users', uid, 'bodyMeasurements', id)); }
export async function saveGoal(uid: string, goal: Goal) { const firestore = requireDb(); await setDoc(doc(firestore, 'users', uid, 'goals', goal.id), goal); }
export async function deleteGoal(uid: string, id: string) { const firestore = requireDb(); await deleteDoc(doc(firestore, 'users', uid, 'goals', id)); }
export async function saveWorkout(uid: string, workout: Workout) {
  const firestore = requireDb(); const workoutRef = doc(firestore, 'users', uid, 'workouts', workout.id); const batch = writeBatch(firestore);
  const { exercises, ...workoutFields } = workout; batch.set(workoutRef, { ...workoutFields, exerciseCount: exercises.length, updatedAt: serverTimestamp() }, { merge: true });
  for (const exercise of exercises) { const exerciseRef = doc(workoutRef, 'exercises', exercise.id); const { sets, ...exerciseFields } = exercise; batch.set(exerciseRef, exerciseFields); for (const set of sets) batch.set(doc(exerciseRef, 'sets', set.id), set); }
  await batch.commit();
}
export async function deleteWorkout(uid: string, id: string) { const firestore = requireDb(); const workoutRef = doc(firestore, 'users', uid, 'workouts', id); const exercises = await getDocs(collection(workoutRef, 'exercises')); const batch = writeBatch(firestore); exercises.docs.forEach((exercise) => batch.delete(exercise.ref)); batch.delete(workoutRef); await batch.commit(); }
