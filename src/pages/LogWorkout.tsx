import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  GripVertical,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Timer,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';
import type { Exercise, ExerciseType, WorkoutSet } from '../types';
import { formatLongDate } from '../utils/calculations';

const exerciseLibrary = [
  'Bench press',
  'Back squat',
  'Romanian deadlift',
  'Seated cable row',
  'Dumbbell shoulder press',
  'Pull-up',
  'Lat pulldown',
  'Walking lunge',
  'Outdoor run',
  'Cycling',
];

const muscleGroupDetails = [
  {
    id: 'Chest',
    target: 'chest',
    title: 'Chest',
    subtitle: 'Pectoralis Major & Minor',
    icon: 'sports_martial_arts',
  },
  {
    id: 'Back',
    target: 'back',
    title: 'Back',
    subtitle: 'Latissimus, Rhomboids, Traps',
    icon: 'accessibility_new',
  },
  {
    id: 'Shoulders',
    target: 'shoulders',
    title: 'Shoulders',
    subtitle: 'Anterior, Lateral, Posterior Delts',
    icon: 'airline_seat_recline_extra',
  },
  {
    id: 'Biceps',
    target: 'biceps',
    title: 'Biceps',
    subtitle: 'Biceps Brachii, Brachialis',
    icon: 'hardware',
  },
  {
    id: 'Triceps',
    target: 'triceps',
    title: 'Triceps',
    subtitle: 'Lateral, Long & Medial Heads',
    icon: 'bolt',
  },
  {
    id: 'Quads',
    target: 'quads',
    title: 'Quads',
    subtitle: 'Quadriceps Femoris',
    icon: 'directions_run',
  },
  {
    id: 'Hamstrings',
    target: 'hamstrings',
    title: 'Hamstrings',
    subtitle: 'Biceps Femoris, Semitendinosus',
    icon: 'downhill_skiing',
  },
  {
    id: 'Glutes',
    target: 'glutes',
    title: 'Glutes',
    subtitle: 'Gluteus Maximus, Medius',
    icon: 'sports_kabaddi',
  },
  {
    id: 'Calves',
    target: 'calves',
    title: 'Calves',
    subtitle: 'Gastrocnemius, Soleus',
    icon: 'stairs',
  },
  {
    id: 'Core',
    target: 'core',
    title: 'Core',
    subtitle: 'Rectus Abdominis, Obliques',
    icon: 'shield',
  },
  {
    id: 'Full body',
    target: 'full body',
    title: 'Full Body',
    subtitle: 'Complete Full-Chain Kinetic System',
    icon: 'all_inclusive',
    badge: 'METABOLIC / COMPOUND',
    fullWidth: true,
  },
];

const muscleGroups = muscleGroupDetails.map((m) => m.id);
const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
const blankSet = (number: number): WorkoutSet => ({
  id: id('set'),
  setNumber: number,
  weight: undefined,
  weightUnit: 'kg',
  reps: undefined,
  completed: false,
});
const blankExercise = (
  order: number,
  name = 'Bench press',
  equipment = 'Bodyweight only',
  muscleGroup = 'Chest'
): Exercise => ({
  id: id('exercise'),
  name,
  equipment,
  muscleGroup,
  exerciseType: 'strength',
  order,
  sets: [blankSet(1)],
});

export function LogWorkout() {
  const { data, addWorkout, updateWorkout } = useGymData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editing = data.workouts.find((item) => item.id === params.get('id'));
  const equipmentChoices = data.profile.equipmentAccess.length
    ? data.profile.equipmentAccess
    : ['Bodyweight only'];

  const [name, setName] = useState(editing?.name ?? 'New training session');
  const [date, setDate] = useState(
    editing?.workoutDate.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState(editing?.category ?? 'Strength');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [exercises, setExercises] = useState<Exercise[]>(
    editing?.exercises ?? [blankExercise(0, 'Bench press', equipmentChoices[0])]
  );
  const [trainingFocus, setTrainingFocus] = useState<string[]>(['Chest']);
  const [focusConfirmed, setFocusConfirmed] = useState(Boolean(editing));
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const filteredLibrary = useMemo(
    () =>
      exerciseLibrary.filter((item) => item.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const toggleTrainingFocus = (group: string) =>
    setTrainingFocus((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group]
    );

  const selectPreset = (targets: string[]) => {
    const matched = muscleGroupDetails
      .filter((m) => targets.includes(m.target))
      .map((m) => m.id);
    setTrainingFocus(matched);
  };

  const clearAllSelections = () => {
    setTrainingFocus([]);
  };

  const continueToWorkout = () => {
    if (!trainingFocus.length) return;
    setExercises((items) =>
      items.map((item, index) =>
        index === 0 ? { ...item, muscleGroup: trainingFocus[0] } : item
      )
    );
    setFocusConfirmed(true);
  };

  const updateExercise = (exerciseId: string, patch: Partial<Exercise>) =>
    setExercises((items) =>
      items.map((item) => (item.id === exerciseId ? { ...item, ...patch } : item))
    );

  const updateSet = (
    exerciseId: string,
    setId: string,
    patch: Partial<WorkoutSet>
  ) =>
    setExercises((items) =>
      items.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, ...patch } : set
              ),
            }
          : exercise
      )
    );

  const addSet = (exercise: Exercise) =>
    updateExercise(exercise.id, {
      sets: [...exercise.sets, blankSet(exercise.sets.length + 1)],
    });

  const removeSet = (exercise: Exercise, setId: string) =>
    updateExercise(exercise.id, {
      sets: exercise.sets
        .filter((set) => set.id !== setId)
        .map((set, index) => ({ ...set, setNumber: index + 1 })),
    });

  const removeExercise = (exerciseId: string) =>
    setExercises((items) =>
      items
        .filter((item) => item.id !== exerciseId)
        .map((item, index) => ({ ...item, order: index }))
    );

  const moveExercise = (index: number, direction: -1 | 1) =>
    setExercises((items) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, itemIndex) => ({ ...item, order: itemIndex }));
    });

  const save = (status: 'draft' | 'completed') => {
    const payload = {
      name,
      workoutDate: new Date(`${date}T08:00:00`).toISOString(),
      category,
      notes,
      status,
      exercises,
      durationSeconds: editing?.durationSeconds ?? 3600,
    };
    if (editing) updateWorkout(editing.id, payload);
    else addWorkout(payload);
    setSaved(true);
    setTimeout(() => navigate('/history'), 500);
  };

  const duplicateCurrent = () => {
    addWorkout({
      name: `${name} copy`,
      workoutDate: new Date().toISOString(),
      category,
      notes,
      status: 'draft',
      exercises: exercises.map((exercise) => ({
        ...exercise,
        id: id('exercise'),
        sets: exercise.sets.map((set) => ({ ...set, id: id('set') })),
      })),
      durationSeconds: 0,
    });
    setSaved(true);
  };

  if (!focusConfirmed) {
    return (
      <div className="flex flex-col w-full max-w-5xl mx-auto pb-space-xxl">
        {/* Notice Banner */}
        <div className="mb-space-lg flex items-center justify-between px-space-md py-space-sm rounded-xl bg-surface-container/60 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              bolt
            </span>
            <p className="font-body-md text-body-md text-on-surface">
              <span className="font-label-lg text-label-lg font-bold text-primary">
                Live Protocol Active:{' '}
              </span>
              <span className="text-on-surface-variant">
                Select target anatomy for real-time tonnage, rep velocity &amp; fatigue telemetry.
              </span>
            </p>
          </div>
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary uppercase tracking-widest shrink-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
            Auto-Sync Ready
          </div>
        </div>

        {/* Primary Training Target Card */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container/85 backdrop-blur-xl shadow-xl p-space-lg md:p-space-xl flex flex-col gap-space-lg">
          {/* Ambient Radial Glow Accent */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>

          {/* Section Header */}
          <div className="flex flex-col gap-space-xs relative z-10">
            <div className="flex items-center gap-space-sm mb-space-xs">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shadow-sm">
                <span className="material-symbols-outlined text-[24px]">fitness_center</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                  Phase 01
                </span>
                <span className="text-primary-container text-xs">•</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container font-bold">
                  Before Your Session
                </span>
              </div>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-wide leading-none">
              What Are You Training Today?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Choose one or more target muscle groups to calibrate volume load. You can add or swap
              exercises dynamically at any point during your lift.
            </p>
          </div>

          {/* Quick Filter / Preset Pills */}
          <div className="flex flex-wrap items-center gap-space-xs pt-space-xs relative z-10">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary mr-space-xs self-center">
              Presets:
            </span>
            <button
              className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-colors"
              onClick={() => selectPreset(['chest', 'shoulders', 'triceps'])}
              type="button"
            >
              Push (Chest / Shoulders / Triceps)
            </button>
            <button
              className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-colors"
              onClick={() => selectPreset(['back', 'biceps'])}
              type="button"
            >
              Pull (Back / Biceps)
            </button>
            <button
              className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-colors"
              onClick={() => selectPreset(['quads', 'hamstrings', 'glutes', 'calves'])}
              type="button"
            >
              Legs (Lower Kinetic Chain)
            </button>
            <button
              className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-colors"
              onClick={() =>
                selectPreset([
                  'chest',
                  'back',
                  'shoulders',
                  'biceps',
                  'triceps',
                  'quads',
                  'hamstrings',
                  'glutes',
                  'calves',
                  'core',
                  'full body',
                ])
              }
              type="button"
            >
              Select All
            </button>
            <button
              className="px-space-sm py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm transition-colors"
              onClick={clearAllSelections}
              type="button"
            >
              Reset
            </button>
          </div>

          {/* Interactive Grid of Muscle Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm relative z-10 pt-space-xs">
            {muscleGroupDetails.map((item) => {
              const isSelected = trainingFocus.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleTrainingFocus(item.id)}
                  className={`muscle-item ${
                    item.fullWidth ? 'md:col-span-2' : ''
                  } group relative flex items-center justify-between p-space-md rounded-lg ${
                    isSelected
                      ? 'bg-surface-container-high shadow-[0_0_15px_rgba(255,94,30,0.15)]'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  } cursor-pointer transition-all duration-200 select-none shadow-sm`}
                >
                  <div className="flex items-center gap-space-md">
                    <div
                      className={`status-indicator w-8 h-8 rounded bg-surface-container-highest group-hover:bg-surface-bright flex items-center justify-center transition-colors ${
                        isSelected ? 'text-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-headline-md text-headline-md text-on-surface tracking-wider uppercase leading-none">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-bright text-primary font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`check-box w-6 h-6 rounded flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary-container' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-surface-container-lowest text-[18px] transition-opacity font-bold ${
                        isSelected ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      check
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions & Telemetry Strip */}
          <div className="pt-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md border-t-0 relative z-10">
            <div className="flex items-center gap-space-md">
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider text-center transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  data_thresholding
                </span>
                <span>Targeting:</span>
                <span className="font-bold text-on-surface" id="selected-count-badge">
                  {trainingFocus.length} {trainingFocus.length === 1 ? 'Group' : 'Groups'} Selected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                disabled={!trainingFocus.length}
                onClick={continueToWorkout}
                className={`w-full md:w-auto px-space-xl py-space-sm rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-lg text-label-lg font-bold uppercase tracking-wider flex items-center justify-center gap-space-sm transition-all shadow-[0_0_20px_rgba(255,94,30,0.35)] ${
                  !trainingFocus.length ? 'opacity-60 pointer-events-none' : ''
                }`}
                id="continue-btn"
                type="button"
              >
                <span>Continue to workout</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry & Insights Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-lg">
          {/* Mini Metric 01 */}
          <div className="p-space-md rounded-xl bg-surface-container/70 backdrop-blur-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-widest">
                Recommended Recovery
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">timelapse</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-metric-stat text-metric-stat text-on-surface">48</span>
              <span className="font-body-md text-body-md text-secondary">HRS / GROUP</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs">
              Optimal protein synthesis window according to last week&apos;s strain load.
            </p>
          </div>

          {/* Mini Metric 02: Readiness Chart */}
          <div className="p-space-md rounded-xl bg-surface-container/70 backdrop-blur-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-widest">
                Readiness Index
              </span>
              <span className="font-label-sm text-label-sm font-bold text-primary-container">
                OPTIMAL 94%
              </span>
            </div>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <svg className="w-full h-12 text-primary-container" fill="none" viewBox="0 0 200 48">
                <path
                  d="M0 38 L30 35 L60 22 L90 28 L120 14 L150 19 L180 8 L200 12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                ></path>
                <path
                  d="M0 38 L30 35 L60 22 L90 28 L120 14 L150 19 L180 8 L200 12 L200 48 L0 48 Z"
                  fill="currentColor"
                  fillOpacity="0.1"
                ></path>
              </svg>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs">
              CNS and musculoskeletal fatigue within green recovery thresholds.
            </p>
          </div>

          {/* Mini Metric 03: Routine Assistant */}
          <div className="p-space-md rounded-xl bg-surface-container/70 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-widest">
                Active Mesocycle
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">schema</span>
            </div>
            <div className="flex flex-col gap-0.5 my-space-xs">
              <span className="font-headline-md text-headline-md text-on-surface uppercase leading-none">
                Hypertrophy Block II
              </span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                Week 4 of 6 • Deload Approaching
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl pb-space-xxl flex flex-col gap-space-lg">
      {/* Phase 02 Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              {editing ? 'EDIT SESSION' : 'PHASE 02 • ACTIVE TELEMETRY LOG'}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-wide leading-none mt-1">
            {editing ? 'REFINE THE RECORD' : 'LOG A WORKOUT'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Record what you did. GymTrack will not prescribe what comes next.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            type="button"
            onClick={() => setFocusConfirmed(false)}
            className="px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Targets ({trainingFocus.length})</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <X size={15} />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={duplicateCurrent}
            className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Copy size={15} />
            <span>Duplicate</span>
          </button>
        </div>
      </div>

      <div className="grid gap-space-lg xl:grid-cols-[1fr_340px]">
        <div className="space-y-space-md">
          {/* Session Meta Card */}
          <div className="rounded-xl bg-surface-container p-space-lg shadow-md">
            <div className="grid gap-space-md sm:grid-cols-[1.4fr_1fr_1fr]">
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Workout name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Upper body strength"
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Date
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                >
                  <option>Strength</option>
                  <option>Cardio</option>
                  <option>Mobility</option>
                  <option>Mixed</option>
                </select>
              </label>
            </div>
            <label className="mt-space-md flex flex-col gap-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                Session notes
              </span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel? Anything worth remembering?"
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
              />
            </label>
          </div>

          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              total={exercises.length}
              equipmentOptions={equipmentChoices}
              muscleOptions={trainingFocus.length ? trainingFocus : muscleGroups}
              onUpdate={updateExercise}
              onUpdateSet={updateSet}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onRemove={() => removeExercise(exercise.id)}
              onMove={moveExercise}
            />
          ))}

          <button
            type="button"
            onClick={() =>
              setExercises((items) => [
                ...items,
                blankExercise(
                  items.length,
                  'Bench press',
                  equipmentChoices[0],
                  trainingFocus[0] ?? 'Chest'
                ),
              ])
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-container-highest bg-surface-container-low/50 py-4 font-label-lg text-label-lg uppercase tracking-wider text-primary hover:bg-surface-container-high transition-all"
          >
            <Plus size={17} /> Add exercise
          </button>
        </div>

        <aside className="space-y-space-md">
          <WorkoutTimers />
          <div className="sticky top-20 rounded-xl bg-surface-container p-space-md shadow-md">
            <div className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              Session check
            </div>
            <div className="mt-space-md space-y-3">
              <Summary label="Date" value={formatLongDate(new Date(`${date}T08:00:00`).toISOString())} />
              <Summary label="Exercises" value={String(exercises.length)} />
              <Summary
                label="Sets"
                value={String(exercises.reduce((sum, item) => sum + item.sets.length, 0))}
              />
              <Summary
                label="Completed"
                value={`${
                  exercises.flatMap((item) => item.sets).filter((set) => set.completed).length
                } sets`}
              />
            </div>
            <div className="mt-space-md space-y-2">
              <button
                type="button"
                onClick={() => save('completed')}
                className="w-full py-2.5 rounded-lg bg-primary-container hover:brightness-110 text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,94,30,0.35)] transition-all"
              >
                <Check size={16} /> Save completed
              </button>
              <button
                type="button"
                onClick={() => save('draft')}
                className="w-full py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Save size={16} /> Save as draft
              </button>
              {saved && (
                <p className="pt-2 text-center font-label-sm text-label-sm text-primary">
                  Saved to performance ledger.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-surface-container p-space-md shadow-md">
            <div className="font-headline-md text-headline-md uppercase text-on-surface tracking-wide">
              Exercise library
            </div>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Search the list, then add a matching exercise or keep the name custom.
            </p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises"
              className="mt-space-sm w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-container"
            />
            <div className="mt-space-sm max-h-44 space-y-1 overflow-y-auto">
              {filteredLibrary.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setExercises((items) => [
                      ...items,
                      blankExercise(
                        items.length,
                        item,
                        equipmentChoices[0],
                        trainingFocus[0] ?? 'Chest'
                      ),
                    ])
                  }
                  className="block w-full rounded-lg px-2.5 py-2 text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WorkoutTimers() {
  const [workoutEnabled, setWorkoutEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [restEnabled, setRestEnabled] = useState(true);
  const [restRunning, setRestRunning] = useState(false);
  const [restSeconds, setRestSeconds] = useState(30);

  useEffect(() => {
    if (!workoutEnabled) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [workoutEnabled]);

  useEffect(() => {
    if (!restEnabled || !restRunning) return;
    const timer = window.setInterval(() => {
      setRestSeconds((value) => {
        if (value <= 1) {
          setRestRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restEnabled, restRunning]);

  const clock = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(
      2,
      '0'
    )}`;
  const resetRest = () => {
    setRestSeconds(30);
    setRestRunning(false);
  };

  return (
    <div className="rounded-xl bg-surface-container p-space-md shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-headline-md text-headline-md uppercase tracking-wide text-on-surface">
            <Timer size={18} className="text-primary-container" /> Session timers
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Keep time your way. Both timers are optional.
          </p>
        </div>
        <StatusToggle enabled={workoutEnabled} onClick={() => setWorkoutEnabled(!workoutEnabled)} />
      </div>
      <div className="mt-space-md grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-container-low p-3">
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Workout
          </div>
          <div className="mt-2 font-metric-stat text-[36px] leading-none tabular-nums text-on-surface">
            {clock(elapsed)}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setElapsed(0)}
              className="p-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface"
            >
              <RotateCcw size={13} />
            </button>
            <span className="font-label-sm text-label-sm text-secondary">
              {workoutEnabled ? 'On' : 'Off'}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-surface-container-low p-3">
          <div className="flex items-center justify-between font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            <span>Rest</span>
            <StatusToggle
              enabled={restEnabled}
              onClick={() => {
                setRestEnabled(!restEnabled);
                setRestRunning(false);
              }}
            />
          </div>
          <div
            className={`mt-2 font-metric-stat text-[36px] leading-none tabular-nums ${
              restSeconds === 0 ? 'text-primary-container' : 'text-on-surface'
            }`}
          >
            {clock(restSeconds)}
          </div>
          <div className="mt-3 flex gap-1.5">
            <button
              type="button"
              disabled={!restEnabled}
              onClick={() => setRestRunning(!restRunning)}
              className="p-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface disabled:opacity-40"
            >
              {restRunning ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              type="button"
              disabled={!restEnabled}
              onClick={resetRest}
              className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant disabled:opacity-40"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setRestSeconds((value) => value + 10)}
          className="rounded bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm text-primary hover:bg-surface-bright"
        >
          +10s
        </button>
      </div>
    </div>
  );
}

function StatusToggle({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider ${
        enabled
          ? 'bg-primary-container text-on-primary-container'
          : 'bg-surface-container-high text-secondary'
      }`}
    >
      {enabled ? 'On' : 'Off'}
    </button>
  );
}

function ExerciseCard({
  exercise,
  index,
  total,
  equipmentOptions,
  muscleOptions,
  onUpdate,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemove,
  onMove,
}: {
  exercise: Exercise;
  index: number;
  total: number;
  equipmentOptions: string[];
  muscleOptions: string[];
  onUpdate: (id: string, patch: Partial<Exercise>) => void;
  onUpdateSet: (exerciseId: string, setId: string, patch: Partial<WorkoutSet>) => void;
  onAddSet: (exercise: Exercise) => void;
  onRemoveSet: (exercise: Exercise, setId: string) => void;
  onRemove: () => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const muscleOptionsWithCurrent = muscleOptions.includes(exercise.muscleGroup ?? '')
    ? muscleOptions
    : [exercise.muscleGroup, ...muscleOptions].filter(Boolean);
  const equipmentOptionsWithCurrent = equipmentOptions.includes(exercise.equipment)
    ? equipmentOptions
    : [exercise.equipment, ...equipmentOptions];

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container shadow-md">
      <div className="flex flex-wrap items-center gap-2 bg-surface-container-high/50 px-3 py-3 sm:gap-3 sm:px-4">
        <GripVertical size={16} className="text-secondary" />
        <div className="min-w-[140px] flex-1">
          <input
            value={exercise.name}
            onChange={(e) => onUpdate(exercise.id, { name: e.target.value })}
            className="w-full bg-transparent px-1 font-headline-md text-headline-md uppercase tracking-wide text-on-surface outline-none focus:ring-1 focus:ring-primary-container rounded"
          />
        </div>
        <select
          value={exercise.exerciseType}
          onChange={(e) =>
            onUpdate(exercise.id, { exerciseType: e.target.value as ExerciseType })
          }
          className="bg-surface-container-low text-on-surface font-label-sm text-label-sm uppercase px-3 py-2 rounded-lg outline-none"
        >
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="mobility">Mobility</option>
        </select>
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="rounded-lg p-2 text-secondary hover:bg-surface-container-high hover:text-on-surface disabled:opacity-30"
          aria-label="Move exercise up"
        >
          <ArrowUp size={15} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="rounded-lg p-2 text-secondary hover:bg-surface-container-high hover:text-on-surface disabled:opacity-30"
          aria-label="Move exercise down"
        >
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-secondary hover:bg-error-container/30 hover:text-error"
          aria-label="Remove exercise"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid gap-3 bg-surface-container-low/50 p-3 sm:grid-cols-2 sm:p-4">
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Targeting muscle
          </span>
          <select
            value={exercise.muscleGroup ?? muscleOptionsWithCurrent[0] ?? 'Chest'}
            onChange={(e) => onUpdate(exercise.id, { muscleGroup: e.target.value })}
            className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-3 py-2 rounded-lg outline-none"
          >
            {muscleOptionsWithCurrent.map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Machine / equipment
          </span>
          <select
            value={exercise.equipment}
            onChange={(e) => onUpdate(exercise.id, { equipment: e.target.value })}
            className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-3 py-2 rounded-lg outline-none"
          >
            {equipmentOptionsWithCurrent.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="p-3 sm:p-4">
        <div className="hidden sm:grid sm:grid-cols-[40px_1.5fr_1fr_1.2fr_42px] sm:gap-2 sm:px-2 sm:pb-2 font-label-sm text-label-sm uppercase tracking-wider text-secondary">
          <span>Set</span>
          <span>Weight + unit</span>
          <span>Reps</span>
          <span>
            {exercise.exerciseType === 'cardio' ? 'Distance / duration' : 'RPE / rest'}
          </span>
          <span />
        </div>

        <div className="space-y-2">
          {exercise.sets.map((set) => (
            <div
              key={set.id}
              className={`grid grid-cols-1 sm:grid-cols-[40px_1.5fr_1fr_1.2fr_42px] items-center gap-2 rounded-lg p-2 ${
                set.completed ? 'bg-primary-container/10' : 'bg-surface-container-low/40'
              }`}
            >
              <span className="text-center font-label-lg text-label-lg font-bold text-primary">
                #{set.setNumber}
              </span>
              {exercise.exerciseType === 'cardio' ? (
                <>
                  <input
                    type="number"
                    placeholder="km"
                    value={set.distance ?? ''}
                    onChange={(e) =>
                      onUpdateSet(exercise.id, set.id, {
                        distance: Number(e.target.value) || undefined,
                      })
                    }
                    className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    placeholder="minutes"
                    value={set.durationSeconds ? Math.round(set.durationSeconds / 60) : ''}
                    onChange={(e) =>
                      onUpdateSet(exercise.id, set.id, {
                        durationSeconds: (Number(e.target.value) || 0) * 60,
                      })
                    }
                    className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg outline-none"
                  />
                </>
              ) : (
                <>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder="amount"
                      value={set.weight ?? ''}
                      onChange={(e) =>
                        onUpdateSet(exercise.id, set.id, {
                          weight: Number(e.target.value) || undefined,
                        })
                      }
                      className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg outline-none"
                    />
                    <select
                      value={set.weightUnit ?? 'kg'}
                      onChange={(e) =>
                        onUpdateSet(exercise.id, set.id, {
                          weightUnit: e.target.value as 'kg' | 'lb',
                        })
                      }
                      className="w-[72px] bg-surface-container-high text-on-surface px-2 py-2 rounded-lg outline-none font-label-sm text-label-sm uppercase"
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="reps"
                    value={set.reps ?? ''}
                    onChange={(e) =>
                      onUpdateSet(exercise.id, set.id, {
                        reps: Number(e.target.value) || undefined,
                      })
                    }
                    className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg outline-none"
                  />
                </>
              )}
              <div className="flex items-center gap-2">
                {exercise.exerciseType !== 'cardio' && (
                  <>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      placeholder="RPE"
                      value={set.rpe ?? ''}
                      onChange={(e) =>
                        onUpdateSet(exercise.id, set.id, {
                          rpe: Number(e.target.value) || undefined,
                        })
                      }
                      className="w-full bg-surface-container-low text-on-surface px-2.5 py-2 rounded-lg outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="rest s"
                      value={set.restSeconds ?? ''}
                      onChange={(e) =>
                        onUpdateSet(exercise.id, set.id, {
                          restSeconds: Number(e.target.value) || undefined,
                        })
                      }
                      className="w-full bg-surface-container-low text-on-surface px-2.5 py-2 rounded-lg outline-none"
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSet(exercise.id, set.id, { completed: !set.completed })
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                    set.completed
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-high text-secondary hover:text-on-surface'
                  }`}
                  aria-label="Mark set completed"
                >
                  <Check size={15} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemoveSet(exercise, set.id)}
                disabled={exercise.sets.length === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-error-container/30 hover:text-error disabled:opacity-30"
                aria-label="Remove set"
              >
                <Minus size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAddSet(exercise)}
          className="mt-3 flex items-center gap-1 px-2 font-label-sm text-label-sm uppercase tracking-wider text-primary hover:text-on-surface"
        >
          <Plus size={14} /> Add set
        </button>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-surface-container-highest pb-3 font-body-md text-body-md last:border-0 last:pb-0">
      <span className="text-secondary">{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  );
}
