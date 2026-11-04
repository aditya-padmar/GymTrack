import type { GymData } from '../types';

const STORAGE_KEY = 'gymtrack-local-data';

export const loadLocalData = (): GymData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...JSON.parse(raw), source: 'local' } : null;
  } catch {
    return null;
  }
};

export const saveLocalData = (data: GymData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, source: 'local' }));
  } catch {
    // Local persistence is a convenience for preview mode; Firestore remains the source of truth when configured.
  }
};

export const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
