import type { Exercise, Goal, Measurement, Workout } from '../types';

export const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric' }).format(new Date(value));
export const formatLongDate = (value: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(value));
export const formatDuration = (seconds = 0) => `${Math.floor(seconds / 60)}m ${seconds % 60 ? `${seconds % 60}s` : ''}`.trim();
export const formatNumber = (value: number, digits = 0) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
export const formatRelative = (value: string) => {
  const days = Math.round((new Date().getTime() - new Date(value).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

export const completedSets = (workout: Workout) => workout.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed);
export const totalSets = (workout: Workout) => completedSets(workout).length;
export const totalReps = (workout: Workout) => completedSets(workout).reduce((sum, set) => sum + (set.reps ?? 0), 0);
export const weightedVolume = (workout: Workout) => completedSets(workout).reduce((sum, set) => sum + ((set.weight ?? 0) * (set.reps ?? 0)), 0);
export const workoutVolume = (workouts: Workout[]) => workouts.reduce((sum, workout) => sum + weightedVolume(workout), 0);
export const allExercises = (workouts: Workout[]) => workouts.flatMap((workout) => workout.exercises);
export const exerciseNames = (workouts: Workout[]) => [...new Set(allExercises(workouts).map((exercise) => exercise.name))];
export const exerciseVolume = (exercise: Exercise) => exercise.sets.filter((set) => set.completed).reduce((sum, set) => sum + ((set.weight ?? 0) * (set.reps ?? 0)), 0);
export const exerciseBestWeight = (workouts: Workout[], name: string) => Math.max(0, ...allExercises(workouts).filter((exercise) => exercise.name === name).flatMap((exercise) => exercise.sets.map((set) => set.weight ?? 0)));
export const exerciseTotalReps = (workouts: Workout[], name: string) => allExercises(workouts).filter((exercise) => exercise.name === name).flatMap((exercise) => exercise.sets).filter((set) => set.completed).reduce((sum, set) => sum + (set.reps ?? 0), 0);
export const estimatedOneRepMax = (weight = 0, reps = 0) => reps > 0 ? weight * (1 + reps / 30) : 0;
export const goalProgress = (goal: Goal) => {
  if (goal.currentValue === undefined || goal.startingValue === undefined || goal.targetValue === goal.startingValue) return 0;
  return Math.max(0, Math.min(100, ((goal.currentValue - goal.startingValue) / (goal.targetValue - goal.startingValue)) * 100));
};
export const filterByRange = <T extends { workoutDate?: string; recordedAt?: string }>(items: T[], range: string) => {
  if (range === 'all') return items;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '3m' ? 90 : 180;
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  return items.filter((item) => new Date(item.workoutDate ?? item.recordedAt ?? '').getTime() >= cutoff.getTime());
};
export const weekKey = (date: string) => {
  const current = new Date(date); const start = new Date(current); const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
