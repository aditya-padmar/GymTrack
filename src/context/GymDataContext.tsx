import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoData } from '../data/demoData';
import { loadLocalData, makeId, saveLocalData } from '../services/localStore';
import { firebaseConfigured } from '../services/firebase';
import { deleteGoal as deleteGoalRemote, deleteMeasurement as deleteMeasurementRemote, deleteWorkout as deleteWorkoutRemote, loadUserData, saveGoal as saveGoalRemote, saveMeasurement as saveMeasurementRemote, saveProfile, saveWorkout as saveWorkoutRemote } from '../services/firestoreService';
import { useAuth } from './AuthContext';
import type { Goal, GymData, Measurement, Profile, Workout } from '../types';

type WorkoutInput = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>;
type MeasurementInput = Omit<Measurement, 'id'>;
type GymDataContextValue = { data: GymData; isPreview: boolean; updateProfile: (patch: Partial<Profile>) => void; addWorkout: (input: WorkoutInput) => Workout; updateWorkout: (id: string, patch: Partial<Workout>) => void; deleteWorkout: (id: string) => void; addMeasurement: (input: MeasurementInput) => void; updateMeasurement: (id: string, patch: Partial<Measurement>) => void; deleteMeasurement: (id: string) => void; addGoal: (input: Omit<Goal, 'id'>) => void; updateGoal: (id: string, patch: Partial<Goal>) => void; deleteGoal: (id: string) => void };
const GymDataContext = createContext<GymDataContextValue | null>(null);

export function GymDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<GymData>(() => loadLocalData() ?? demoData);
  const isPreview = !user && !firebaseConfigured;
  useEffect(() => { let cancelled = false; if (user && firebaseConfigured) { loadUserData(user.uid, demoData).then((next) => { if (!cancelled) setData(next); }).catch(() => { if (!cancelled) setData({ ...demoData, source: 'local' }); }); } else if (!user) { setData(loadLocalData() ?? demoData); } return () => { cancelled = true; }; }, [user]);
  const commit = (next: GymData) => { const normalized = { ...next, source: user && firebaseConfigured ? 'firestore' as const : 'local' as const }; setData(normalized); if (!user || !firebaseConfigured) saveLocalData(normalized); return normalized; };
  const updateProfile = (patch: Partial<Profile>) => { const nextProfile = { ...data.profile, ...patch, updatedAt: new Date().toISOString() }; commit({ ...data, profile: nextProfile }); if (user && firebaseConfigured) void saveProfile(user.uid, patch); };
  const addWorkout = (input: WorkoutInput) => { const now = new Date().toISOString(); const workout: Workout = { ...input, id: makeId('workout'), createdAt: now, updatedAt: now }; commit({ ...data, workouts: [workout, ...data.workouts] }); if (user && firebaseConfigured) void saveWorkoutRemote(user.uid, workout); return workout; };
  const updateWorkout = (id: string, patch: Partial<Workout>) => { const workout = data.workouts.find((item) => item.id === id); if (!workout) return; const updated = { ...workout, ...patch, updatedAt: new Date().toISOString() }; commit({ ...data, workouts: data.workouts.map((item) => item.id === id ? updated : item) }); if (user && firebaseConfigured) void saveWorkoutRemote(user.uid, updated); };
  const deleteWorkout = (id: string) => { commit({ ...data, workouts: data.workouts.filter((workout) => workout.id !== id) }); if (user && firebaseConfigured) void deleteWorkoutRemote(user.uid, id); };
  const addMeasurement = (input: MeasurementInput) => { const measurement = { ...input, id: makeId('measurement') }; commit({ ...data, measurements: [measurement, ...data.measurements] }); if (user && firebaseConfigured) void saveMeasurementRemote(user.uid, measurement); };
  const updateMeasurement = (id: string, patch: Partial<Measurement>) => { const measurement = data.measurements.find((item) => item.id === id); if (!measurement) return; const updated = { ...measurement, ...patch }; commit({ ...data, measurements: data.measurements.map((item) => item.id === id ? updated : item) }); if (user && firebaseConfigured) void saveMeasurementRemote(user.uid, updated); };
  const deleteMeasurement = (id: string) => { commit({ ...data, measurements: data.measurements.filter((item) => item.id !== id) }); if (user && firebaseConfigured) void deleteMeasurementRemote(user.uid, id); };
  const addGoal = (input: Omit<Goal, 'id'>) => { const goal = { ...input, id: makeId('goal') }; commit({ ...data, goals: [goal, ...data.goals] }); if (user && firebaseConfigured) void saveGoalRemote(user.uid, goal); };
  const updateGoal = (id: string, patch: Partial<Goal>) => { const goal = data.goals.find((item) => item.id === id); if (!goal) return; const updated = { ...goal, ...patch }; commit({ ...data, goals: data.goals.map((item) => item.id === id ? updated : item) }); if (user && firebaseConfigured) void saveGoalRemote(user.uid, updated); };
  const deleteGoal = (id: string) => { commit({ ...data, goals: data.goals.filter((goal) => goal.id !== id) }); if (user && firebaseConfigured) void deleteGoalRemote(user.uid, id); };
  const value = useMemo(() => ({ data, isPreview, updateProfile, addWorkout, updateWorkout, deleteWorkout, addMeasurement, updateMeasurement, deleteMeasurement, addGoal, updateGoal, deleteGoal }), [data, isPreview, user]);
  return <GymDataContext.Provider value={value}>{children}</GymDataContext.Provider>;
}

export function useGymData() { const context = useContext(GymDataContext); if (!context) throw new Error('useGymData must be used inside GymDataProvider'); return context; }
