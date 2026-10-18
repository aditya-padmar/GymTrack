export type Units = 'metric' | 'imperial';
export type ExerciseType = 'strength' | 'cardio' | 'bodyweight' | 'mobility';
export type WorkoutStatus = 'draft' | 'completed';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Profile {
  uid: string;
  displayName: string;
  email: string;
  height?: number;
  currentWeight?: number;
  preferredUnits: Units;
  primaryGoal?: string;
  secondaryGoals: string[];
  equipmentAccess: string[];
  targetWeight?: number;
  targetDate?: string;
  onboardingCompleted: boolean;
  weeklyTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  reps?: number;
  completed: boolean;
  restSeconds?: number;
  rpe?: number;
  durationSeconds?: number;
  distance?: number;
  distanceUnit?: 'km' | 'mi';
}

export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup?: string;
  exerciseType: ExerciseType;
  notes?: string;
  order: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  workoutDate: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  category?: string;
  status: WorkoutStatus;
  notes?: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  recordedAt: string;
  weight?: number;
  height?: number;
  waist?: number;
  chest?: number;
  arm?: number;
  thigh?: number;
  hip?: number;
  bodyFatPercentage?: number;
  unitSystem: Units;
}

export interface Goal {
  id: string;
  goalType: 'body_weight' | 'exercise_performance' | 'workout_frequency' | 'consistency' | 'measurement';
  name: string;
  startingValue?: number;
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate: string;
  targetDate?: string;
  status: GoalStatus;
}

export interface GymData {
  profile: Profile;
  workouts: Workout[];
  measurements: Measurement[];
  goals: Goal[];
  source: 'preview' | 'local' | 'firestore';
}
