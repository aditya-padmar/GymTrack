import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoData } from '../data/demoData';
import { loadLocalData, makeId, saveLocalData } from '../services/localStore';
import { firebaseConfigured } from '../services/firebase';
import {
  deleteGoal as deleteGoalRemote,
  deleteMeasurement as deleteMeasurementRemote,
  deleteWorkout as deleteWorkoutRemote,
  loadUserData,
  saveGoal as saveGoalRemote,
  saveMeasurement as saveMeasurementRemote,
  saveProfile,
  saveWorkout as saveWorkoutRemote,
} from '../services/firestoreService';
import { useAuth } from './AuthContext';
import type { Goal, GymData, Measurement, Profile, Workout } from '../types';

type WorkoutInput = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>;
type MeasurementInput = Omit<Measurement, 'id'>;
type GymDataContextValue = {
  data: GymData;
  isPreview: boolean;
  startFreshWorkspace: (profile?: Partial<Profile>) => void;
  activateLoginWorkspace: (profile?: Partial<Profile>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addWorkout: (input: WorkoutInput) => Workout;
  updateWorkout: (id: string, patch: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addMeasurement: (input: MeasurementInput) => void;
  updateMeasurement: (id: string, patch: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
  addGoal: (input: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
};
const GymDataContext = createContext<GymDataContextValue | null>(null);

function emptyWorkspace(profilePatch: Partial<Profile> = {}): GymData {
  const now = new Date().toISOString();
  return {
    profile: {
      ...demoData.profile,
      ...profilePatch,
      uid: profilePatch.uid ?? `preview-${makeId('user')}`,
      displayName: profilePatch.displayName ?? 'Athlete',
      email: profilePatch.email ?? '',
      age: profilePatch.age,
      gender: profilePatch.gender,
      height: profilePatch.height,
      currentWeight: profilePatch.currentWeight,
      targetWeight: profilePatch.targetWeight,
      primaryGoal: profilePatch.primaryGoal,
      secondaryGoals: [],
      equipmentAccess: [],
      onboardingCompleted: false,
      weeklyTarget: undefined,
      createdAt: now,
      updatedAt: now,
    },
    workouts: [],
    measurements: [],
    goals: [],
    source: 'local',
  };
}

export function GymDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<GymData>(() => loadLocalData() ?? demoData);
  const isRemoteUser = Boolean(user && firebaseConfigured && !user.isLocal);
  const isPreview = !user;

  useEffect(() => {
    let cancelled = false;
    if (user && firebaseConfigured && !user.isLocal) {
      loadUserData(user.uid, demoData)
        .then((next) => {
          if (!cancelled) {
            setData(next);
            saveLocalData(next);
          }
        })
        .catch(() => {
          if (!cancelled) {
            const local = loadLocalData() ?? demoData;
            setData({ ...local, source: 'local' });
          }
        });
    } else if (!user) {
      setData(loadLocalData() ?? demoData);
    }
    return () => {
      cancelled = true;
    };
  }, [user]);

  const commit = (next: GymData) => {
    const normalized = {
      ...next,
      source: isRemoteUser ? ('firestore' as const) : ('local' as const),
    };
    setData(normalized);
    saveLocalData(normalized);
    return normalized;
  };

  const startFreshWorkspace = (profilePatch: Partial<Profile> = {}) => {
    const next = emptyWorkspace(profilePatch);
    setData(next);
    saveLocalData(next);
  };

  const activateLoginWorkspace = (profilePatch: Partial<Profile> = {}) => {
    const current = loadLocalData() ?? demoData;
    const hasWorkouts = current.workouts.length > 0;
    const baseData = hasWorkouts ? current : demoData;
    const next: GymData = {
      ...baseData,
      profile: {
        ...baseData.profile,
        ...profilePatch,
        displayName:
          profilePatch.displayName ||
          baseData.profile.displayName ||
          'Aditya Bhat',
        email: profilePatch.email || baseData.profile.email || 'athlete@gymtrack.internal',
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      },
    };
    setData(next);
    saveLocalData(next);
    if (isRemoteUser && user) {
      void saveProfile(user.uid, next.profile).catch(() => {});
    }
  };

  const updateProfile = (patch: Partial<Profile>) => {
    const nextProfile = { ...data.profile, ...patch, updatedAt: new Date().toISOString() };
    commit({ ...data, profile: nextProfile });
    if (isRemoteUser && user) void saveProfile(user.uid, patch).catch(() => {});
  };

  const addWorkout = (input: WorkoutInput) => {
    const now = new Date().toISOString();
    const workout: Workout = { ...input, id: makeId('workout'), createdAt: now, updatedAt: now };
    commit({ ...data, workouts: [workout, ...data.workouts] });
    if (isRemoteUser && user) void saveWorkoutRemote(user.uid, workout).catch(() => {});
    return workout;
  };

  const updateWorkout = (id: string, patch: Partial<Workout>) => {
    const workout = data.workouts.find((item) => item.id === id);
    if (!workout) return;
    const updated = { ...workout, ...patch, updatedAt: new Date().toISOString() };
    commit({ ...data, workouts: data.workouts.map((item) => (item.id === id ? updated : item)) });
    if (isRemoteUser && user) void saveWorkoutRemote(user.uid, updated).catch(() => {});
  };

  const deleteWorkout = (id: string) => {
    commit({ ...data, workouts: data.workouts.filter((workout) => workout.id !== id) });
    if (isRemoteUser && user) void deleteWorkoutRemote(user.uid, id).catch(() => {});
  };

  const addMeasurement = (input: MeasurementInput) => {
    const measurement = { ...input, id: makeId('measurement') };
    commit({ ...data, measurements: [measurement, ...data.measurements] });
    if (isRemoteUser && user) void saveMeasurementRemote(user.uid, measurement).catch(() => {});
  };

  const updateMeasurement = (id: string, patch: Partial<Measurement>) => {
    const measurement = data.measurements.find((item) => item.id === id);
    if (!measurement) return;
    const updated = { ...measurement, ...patch };
    commit({
      ...data,
      measurements: data.measurements.map((item) => (item.id === id ? updated : item)),
    });
    if (isRemoteUser && user) void saveMeasurementRemote(user.uid, updated).catch(() => {});
  };

  const deleteMeasurement = (id: string) => {
    commit({
      ...data,
      measurements: data.measurements.filter((measurement) => measurement.id !== id),
    });
    if (isRemoteUser && user) void deleteMeasurementRemote(user.uid, id).catch(() => {});
  };

  const addGoal = (input: Omit<Goal, 'id'>) => {
    const goal = { ...input, id: makeId('goal') };
    commit({ ...data, goals: [goal, ...data.goals] });
    if (isRemoteUser && user) void saveGoalRemote(user.uid, goal).catch(() => {});
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    const goal = data.goals.find((item) => item.id === id);
    if (!goal) return;
    const updated = { ...goal, ...patch };
    commit({ ...data, goals: data.goals.map((item) => (item.id === id ? updated : item)) });
    if (isRemoteUser && user) void saveGoalRemote(user.uid, updated).catch(() => {});
  };

  const deleteGoal = (id: string) => {
    commit({ ...data, goals: data.goals.filter((goal) => goal.id !== id) });
    if (isRemoteUser && user) void deleteGoalRemote(user.uid, id).catch(() => {});
  };

  const value = useMemo(
    () => ({
      data,
      isPreview,
      startFreshWorkspace,
      activateLoginWorkspace,
      updateProfile,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      addMeasurement,
      updateMeasurement,
      deleteMeasurement,
      addGoal,
      updateGoal,
      deleteGoal,
    }),
    [data, isPreview, user]
  );

  return <GymDataContext.Provider value={value}>{children}</GymDataContext.Provider>;
}

export function useGymData() {
  const context = useContext(GymDataContext);
  if (!context) throw new Error('useGymData must be used inside GymDataProvider');
  return context;
}

