import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGymData } from '../context/GymDataContext';
import {
  allExercises,
  estimatedOneRepMax,
  exerciseBestWeight,
  exerciseTotalReps,
  exerciseVolume,
  formatDate,
} from '../utils/calculations';

const defaultMovements = [
  'Bench press',
  'Back Squat',
  'Conventional Deadlift',
  'Overhead Press',
];

export function Progress() {
  const { data } = useGymData();
  const navigate = useNavigate();

  const names = useMemo(() => {
    const logged = [...new Set(allExercises(data.workouts).map((exercise) => exercise.name))];
    const combined = [...new Set([...logged, ...defaultMovements])];
    return combined.length ? combined : defaultMovements;
  }, [data.workouts]);

  const [selected, setSelected] = useState(names[0] ?? 'Bench press');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [metricMode, setMetricMode] = useState<'weight' | '1rm' | 'volume'>('weight');

  const history = useMemo(
    () =>
      data.workouts
        .flatMap((workout) =>
          workout.exercises
            .filter((exercise) => exercise.name.toLowerCase() === selected.toLowerCase())
            .map((exercise) => {
              const maxWeight = Math.max(0, ...exercise.sets.map((set) => set.weight ?? 0));
              const topSet = [...exercise.sets].sort(
                (a, b) => (b.weight ?? 0) * (b.reps ?? 0) - (a.weight ?? 0) * (a.reps ?? 0)
              )[0];
              const e1rm = topSet?.weight
                ? Number(estimatedOneRepMax(topSet.weight, topSet.reps ?? 0).toFixed(1))
                : 0;
              return {
                date: formatDate(workout.workoutDate),
                volume: exerciseVolume(exercise),
                weight: maxWeight,
                e1rm,
                reps: exercise.sets.reduce((sum, set) => sum + (set.reps ?? 0), 0),
              };
            })
        )
        .reverse(),
    [data.workouts, selected]
  );

  const bestWeight = exerciseBestWeight(data.workouts, selected);
  const totalReps = exerciseTotalReps(data.workouts, selected);
  const bestSet = allExercises(data.workouts)
    .filter((exercise) => exercise.name.toLowerCase() === selected.toLowerCase())
    .flatMap((exercise) => exercise.sets)
    .sort((a, b) => (b.weight ?? 0) * (b.reps ?? 0) - (a.weight ?? 0) * (a.reps ?? 0))[0];

  const chartKey = metricMode === '1rm' ? 'e1rm' : metricMode === 'volume' ? 'volume' : 'weight';

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Notice Banner */}
      <div className="flex items-center justify-between px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-7 h-7 rounded bg-primary-container/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              offline_bolt
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant truncate">
            <strong className="text-on-surface font-semibold">Preview data is active.</strong>{' '}
            Connect cloud telemetry sync to make this lifting log persistent across athletic rigs.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors uppercase font-bold shrink-0 ml-space-md"
          type="button"
        >
          <span>Setup Telemetry</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Header & Exercise Filter Control */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm tracking-widest uppercase text-primary font-bold">
              PERFORMANCE LENS
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-wide leading-none">
            EXERCISE PROGRESS
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Compare like-for-like records without flattening every variation into one number.
          </p>
        </div>

        {/* Movement Filter Selector */}
        <div className="relative inline-flex items-center self-start md:self-auto min-w-[240px]">
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-space-sm bg-surface-container px-space-md py-2.5 rounded-lg shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer group"
            id="exercise-dropdown-trigger"
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-primary-container">
                fitness_center
              </span>
              <span
                className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider"
                id="current-exercise-label"
              >
                {selected}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
              id="dropdown-chevron"
            >
              expand_more
            </span>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute top-full right-0 left-0 mt-1 z-30 bg-surface-container-high rounded-lg p-1 shadow-xl flex flex-col gap-0.5"
              id="exercise-dropdown-menu"
            >
              {names.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelected(item);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-space-sm py-2 rounded font-label-sm text-label-sm uppercase font-semibold transition-colors ${
                    selected === item
                      ? 'text-primary-container bg-surface-container'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Metrics Grid (4 Key Performance Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* 1. Best Recorded Weight */}
        <div className="relative bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between overflow-hidden shadow-sm hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
              BEST RECORDED WEIGHT
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">
              bookmark
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs py-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="stat-best-weight"
            >
              {bestWeight ? bestWeight : '—'}
            </span>
            <span
              className="font-label-sm text-label-sm uppercase text-secondary font-bold"
              id="stat-best-unit"
            >
              KG
            </span>
          </div>
          <div className="pt-space-xs">
            <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              Highest logged set
            </span>
          </div>
        </div>

        {/* 2. Top Set Estimate */}
        <div className="relative bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between overflow-hidden shadow-sm hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
              TOP SET ESTIMATE
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">
              trending_up
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs py-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="stat-est-1rm"
            >
              {bestSet?.weight
                ? estimatedOneRepMax(bestSet.weight, bestSet.reps ?? 0).toFixed(1)
                : '—'}
            </span>
            <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
              E1RM
            </span>
          </div>
          <div className="pt-space-xs">
            <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              Estimated 1RM · not a promise
            </span>
          </div>
        </div>

        {/* 3. Total Repetitions */}
        <div className="relative bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between overflow-hidden shadow-sm hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
              TOTAL REPETITIONS
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">
              reorder
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs py-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="stat-total-reps"
            >
              {totalReps}
            </span>
            <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
              REPS
            </span>
          </div>
          <div className="pt-space-xs">
            <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              Completed sets only
            </span>
          </div>
        </div>

        {/* 4. Sessions Recorded */}
        <div className="relative bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between overflow-hidden shadow-sm hover:bg-surface-container transition-colors">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
              SESSIONS RECORDED
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-container">
              calendar_month
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs py-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="stat-sessions"
            >
              {history.length}
            </span>
            <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">
              SESS
            </span>
          </div>
          <div className="pt-space-xs">
            <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              This exercise
            </span>
          </div>
        </div>
      </div>

      {/* Analytical Dual-Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left Main Module: Historical Performance Trend */}
        <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between min-h-[440px] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
                HISTORICAL PERFORMANCE
              </span>
              <h2
                className="font-headline-md text-headline-md uppercase text-on-surface tracking-wide"
                id="chart-subhead"
              >
                {selected} over time
              </h2>
            </div>

            {/* Metric Scope Toggle */}
            <div className="inline-flex items-center bg-surface-container rounded-lg p-0.5 self-start sm:self-auto">
              <button
                onClick={() => setMetricMode('weight')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm uppercase font-bold transition-all ${
                  metricMode === 'weight'
                    ? 'text-on-primary-container bg-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Weight / Set
              </button>
              <button
                onClick={() => setMetricMode('1rm')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm uppercase font-bold transition-all ${
                  metricMode === '1rm'
                    ? 'text-on-primary-container bg-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                1RM Trend
              </button>
              <button
                onClick={() => setMetricMode('volume')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm uppercase font-bold transition-all ${
                  metricMode === 'volume'
                    ? 'text-on-primary-container bg-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Volume
              </button>
            </div>
          </div>

          {/* Chart State Container */}
          <div className="relative flex-1 flex flex-col items-center justify-center py-space-xl my-space-md">
            {history.length > 0 ? (
              <div className="w-full h-[280px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid vertical={false} stroke="#333539" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#c0c6d7', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#c0c6d7', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e2024',
                        border: '1px solid #333539',
                        borderRadius: 8,
                        color: '#e2e2e8',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={chartKey}
                      stroke="#ff5e1e"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0c0e12', stroke: '#ff5e1e', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center text-center max-w-sm gap-space-sm z-10"
                id="historical-empty-state"
              >
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-space-xs">
                  <span className="material-symbols-outlined text-[28px]">query_stats</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Log this exercise in a workout to see its history.
                </p>
                <button
                  onClick={() => navigate('/log-workout')}
                  className="mt-space-xs inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase font-bold tracking-wider transition-colors shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary-container">
                    add_circle
                  </span>
                  <span>Record Baseline Set</span>
                </button>
              </div>
            )}

            {/* Inline Ambient Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full h-px bg-secondary-container"></div>
              <div className="w-full h-px bg-secondary-container"></div>
              <div className="w-full h-px bg-secondary-container"></div>
              <div className="w-full h-px bg-secondary-container"></div>
              <div className="w-full h-px bg-secondary-container"></div>
            </div>
          </div>

          {/* Footnote Meta */}
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              CHRONO: 90-DAY WINDOW
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              TELEMETRY ID: 0x4B92
            </span>
          </div>
        </div>

        {/* Right Auxiliary Module: Set-By-Set Evidence */}
        <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between min-h-[440px] shadow-sm">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
                SET-BY-SET EVIDENCE
              </span>
              <span className="material-symbols-outlined text-[20px] text-secondary">
                table_rows
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-wide">
              Volume snapshots
            </h2>
          </div>

          {history.length > 0 ? (
            <div className="flex-1 flex flex-col gap-space-xs py-space-md overflow-y-auto">
              {history
                .slice()
                .reverse()
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={`${item.date}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-surface-container p-space-sm"
                  >
                    <div>
                      <div className="font-label-lg text-label-lg font-bold text-on-surface">
                        {item.date}
                      </div>
                      <div className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">
                        {item.reps} total reps · best set {item.weight || '—'} kg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-headline-md text-[22px] text-primary-container leading-none">
                        {item.volume ? item.volume.toLocaleString() : '—'}
                      </div>
                      <div className="font-label-sm text-label-sm text-secondary uppercase">
                        kg volume
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-space-xl gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant/70">
                <span className="material-symbols-outlined text-[24px]">dataset</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                No comparable sets yet.
              </p>
              <span className="font-label-sm text-label-sm uppercase text-secondary font-semibold tracking-wider">
                Standard thresholds: 3-5 Reps · 6-8 Reps · 10+ Reps
              </span>
            </div>
          )}

          {/* Progression Intelligence Card */}
          <div className="bg-surface-container rounded-lg p-space-md flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-[20px] text-primary-container shrink-0 mt-0.5">
              tips_and_updates
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                PROGRESSION LOGIC
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs leading-normal">
                Isolated set tracking automatically factors RPE deltas to prevent false plateaus
                during high-fatigue training phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
