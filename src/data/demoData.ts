import type { Goal, GymData, Measurement, Profile, Workout } from '../types';

const now = new Date();
const iso = (daysAgo: number, hour = 7) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const profile: Profile = {
  uid: 'preview-user',
  displayName: 'Alex Morgan',
  email: 'preview@gymtrack.app',
  height: 178,
  currentWeight: 78.4,
  preferredUnits: 'metric',
  primaryGoal: 'Strength improvement',
  secondaryGoals: ['Workout consistency'],
  equipmentAccess: ['Full gym', 'Dumbbells', 'Cable machines'],
  targetWeight: 80,
  onboardingCompleted: true,
  weeklyTarget: 4,
  createdAt: iso(70),
  updatedAt: iso(0),
};

const workouts: Workout[] = [
  {
    id: 'workout-1', name: 'Upper body strength', workoutDate: iso(1), durationSeconds: 3180, category: 'Strength', status: 'completed',
    notes: 'Clean, focused session. Kept rest consistent.', createdAt: iso(1), updatedAt: iso(1), exercises: [
      { id: 'ex-1', name: 'Bench press', equipment: 'Barbell', muscleGroup: 'Chest', exerciseType: 'strength', order: 0, sets: [
        { id: 's-1', setNumber: 1, weight: 70, weightUnit: 'kg', reps: 8, completed: true }, { id: 's-2', setNumber: 2, weight: 72.5, weightUnit: 'kg', reps: 6, completed: true }, { id: 's-3', setNumber: 3, weight: 72.5, weightUnit: 'kg', reps: 6, completed: true },
      ] },
      { id: 'ex-2', name: 'Seated cable row', equipment: 'Cable machine', muscleGroup: 'Back', exerciseType: 'strength', order: 1, sets: [
        { id: 's-4', setNumber: 1, weight: 55, weightUnit: 'kg', reps: 10, completed: true }, { id: 's-5', setNumber: 2, weight: 55, weightUnit: 'kg', reps: 10, completed: true }, { id: 's-6', setNumber: 3, weight: 60, weightUnit: 'kg', reps: 8, completed: true },
      ] },
      { id: 'ex-3', name: 'Dumbbell shoulder press', equipment: 'Dumbbells', muscleGroup: 'Shoulders', exerciseType: 'strength', order: 2, sets: [
        { id: 's-7', setNumber: 1, weight: 20, weightUnit: 'kg', reps: 10, completed: true }, { id: 's-8', setNumber: 2, weight: 20, weightUnit: 'kg', reps: 9, completed: true },
      ] },
    ],
  },
  {
    id: 'workout-2', name: 'Lower body volume', workoutDate: iso(3), durationSeconds: 3720, category: 'Strength', status: 'completed',
    notes: 'Longer session with controlled tempo.', createdAt: iso(3), updatedAt: iso(3), exercises: [
      { id: 'ex-4', name: 'Back squat', equipment: 'Barbell', muscleGroup: 'Legs', exerciseType: 'strength', order: 0, sets: [
        { id: 's-9', setNumber: 1, weight: 90, weightUnit: 'kg', reps: 8, completed: true }, { id: 's-10', setNumber: 2, weight: 95, weightUnit: 'kg', reps: 6, completed: true }, { id: 's-11', setNumber: 3, weight: 95, weightUnit: 'kg', reps: 6, completed: true }, { id: 's-12', setNumber: 4, weight: 90, weightUnit: 'kg', reps: 8, completed: true },
      ] },
      { id: 'ex-5', name: 'Romanian deadlift', equipment: 'Barbell', muscleGroup: 'Hamstrings', exerciseType: 'strength', order: 1, sets: [
        { id: 's-13', setNumber: 1, weight: 80, weightUnit: 'kg', reps: 8, completed: true }, { id: 's-14', setNumber: 2, weight: 80, weightUnit: 'kg', reps: 8, completed: true }, { id: 's-15', setNumber: 3, weight: 85, weightUnit: 'kg', reps: 6, completed: true },
      ] },
    ],
  },
  {
    id: 'workout-3', name: 'Conditioning run', workoutDate: iso(5), durationSeconds: 1920, category: 'Cardio', status: 'completed',
    notes: 'Easy pace, logged for consistency.', createdAt: iso(5), updatedAt: iso(5), exercises: [
      { id: 'ex-6', name: 'Outdoor run', equipment: 'Bodyweight only', muscleGroup: 'Full body', exerciseType: 'cardio', order: 0, sets: [
        { id: 's-16', setNumber: 1, durationSeconds: 1800, distance: 4.2, distanceUnit: 'km', completed: true },
      ] },
    ],
  },
];

const measurements: Measurement[] = [
  { id: 'm-1', recordedAt: iso(30, 8), weight: 79.8, waist: 84, unitSystem: 'metric' },
  { id: 'm-2', recordedAt: iso(15, 8), weight: 79.1, waist: 83.5, unitSystem: 'metric' },
  { id: 'm-3', recordedAt: iso(1, 8), weight: 78.4, waist: 82.8, unitSystem: 'metric' },
];

const goals: Goal[] = [
  { id: 'g-1', goalType: 'workout_frequency', name: 'Train 4 times per week', startingValue: 2, targetValue: 4, currentValue: 3, unit: 'sessions/week', startDate: iso(28), status: 'active' },
  { id: 'g-2', goalType: 'exercise_performance', name: 'Bench press 80 kg', startingValue: 65, targetValue: 80, currentValue: 72.5, unit: 'kg', startDate: iso(42), targetDate: iso(-18), status: 'active' },
];

export const demoData: GymData = { profile, workouts, measurements, goals, source: 'preview' };
