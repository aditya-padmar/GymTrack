import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';
import {
  completedSets,
  formatDate,
  formatDuration,
  goalProgress,
  totalSets,
  weightedVolume,
} from '../utils/calculations';

export function Dashboard() {
  const { data } = useGymData();
  const navigate = useNavigate();

  const firstName = (data.profile.displayName || 'Aditya').split(' ')[0];
  const recent = useMemo(
    () =>
      [...data.workouts]
        .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())
        .slice(0, 4),
    [data.workouts]
  );

  const weekWorkouts = useMemo(
    () =>
      data.workouts.filter(
        (workout) => Date.now() - new Date(workout.workoutDate).getTime() < 7 * 86400000
      ),
    [data.workouts]
  );

  const volume = useMemo(
    () => data.workouts.reduce((sum, workout) => sum + weightedVolume(workout), 0),
    [data.workouts]
  );

  const sets = useMemo(
    () => data.workouts.reduce((sum, workout) => sum + totalSets(workout), 0),
    [data.workouts]
  );

  const weeklyTarget = data.profile.weeklyTarget ?? 4;
  const weeklyPercent = Math.min(100, Math.round((weekWorkouts.length / Math.max(1, weeklyTarget)) * 100));

  const latestMeasurementWeight = useMemo(() => {
    const sorted = [...data.measurements].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
    return sorted[0]?.weight ?? data.profile.currentWeight ?? 76.0;
  }, [data.measurements, data.profile.currentWeight]);

  const chartDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        const dayWorkouts = data.workouts.filter((workout) => {
          const workoutDate = new Date(workout.workoutDate);
          return workoutDate.toDateString() === date.toDateString();
        });
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sessions: dayWorkouts.length,
          volume: dayWorkouts.reduce((sum, workout) => sum + weightedVolume(workout), 0),
          isToday: index === 6,
        };
      }),
    [data.workouts]
  );

  const maxDayVolume = Math.max(6000, ...chartDays.map((d) => d.volume));
  const freqPoints = chartDays
    .map((d, idx) => {
      const x = 50 + idx * 100;
      const y = 158 - Math.min(4, d.sessions) * 35;
      return `${x},${y}`;
    })
    .join(' ');
  const todayPointY = 158 - Math.min(4, chartDays[6]?.sessions ?? 0) * 35;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top System Alert Bar */}
      <div className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0">bolt</span>
          <div className="flex items-center gap-space-xs truncate">
            <span className="font-label-lg text-label-lg text-on-surface">
              Telemetry stream active.
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant truncate">
              Cloud synchronizer synchronized with local performance database.
            </span>
          </div>
        </div>
        <Link
          className="font-label-sm text-label-sm text-primary hover:text-on-surface flex items-center gap-1 transition-colors uppercase shrink-0"
          to="/settings"
        >
          <span>Database Link</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* Hero Header Greeting & Primary CTA */}
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm tracking-widest text-primary uppercase">
              Performance Hub
            </span>
            <span className="font-label-sm text-label-sm text-outline-variant">/</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Current Cycle
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-wide uppercase leading-none">
            Good morning, {firstName}.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            A clear view of the work you&apos;ve logged recently and active training volume.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => navigate('/analytics')}
            className="px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all flex items-center gap-space-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Filter Period</span>
          </button>
          <button
            onClick={() => navigate('/log-workout')}
            className="px-space-lg py-2.5 rounded-lg bg-primary-container hover:brightness-110 text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider flex items-center gap-space-xs shadow-[0_0_20px_rgba(255,94,30,0.35)] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      {/* 4-Card Key Telemetry Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: THIS WEEK */}
        <div className="relative bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:bg-surface-container-high transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              This Week
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs my-space-sm">
            <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
              {weekWorkouts.length}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">sessions</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
            <span className="font-label-sm text-label-sm">Target: {weeklyTarget} sessions / wk</span>
            <span className="font-label-sm text-label-sm text-primary uppercase">
              {weeklyPercent}% Met
            </span>
          </div>
        </div>

        {/* Card 2: TRAINING VOLUME */}
        <div className="relative bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:bg-surface-container-high transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Training Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">fitness_center</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs my-space-sm">
            <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
              {volume > 1000 ? `${(volume / 1000).toFixed(1)}k` : volume}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">kg total</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
            <span className="font-label-sm text-label-sm">Compatible logged sets</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
          </div>
        </div>

        {/* Card 3: COMPLETED SETS */}
        <div className="relative bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:bg-surface-container-high transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Completed Sets
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">layers</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs my-space-sm">
            <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
              {sets}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">sets</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
            <span className="font-label-sm text-label-sm">Across all time</span>
            <span className="font-label-sm text-label-sm text-secondary">RPE tracked</span>
          </div>
        </div>

        {/* Card 4: CURRENT WEIGHT */}
        <div className="relative bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:bg-surface-container-high transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Current Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">monitor_weight</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs my-space-sm">
            <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
              {latestMeasurementWeight.toFixed(1)}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">kg</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Latest recorded
            </span>
            <span className="font-label-sm text-label-sm text-primary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_flat</span>
              <span>Baseline</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Analytics Row: Consistency Pulse + Goal Signal Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Consistency Pulse (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Consistency Pulse
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-wide uppercase">
                Your Last 7 Days
              </h2>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Session frequency indicator, not a strict prescription.
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="px-2.5 py-1 rounded bg-surface-container-high font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                Last 7 Days
              </span>
            </div>
          </div>

          {/* Pulse Telemetry Chart SVG Graphic */}
          <div className="w-full flex-1 flex flex-col justify-end pt-space-md">
            <div className="relative w-full h-44">
              {/* Subtle Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
              </div>
              {/* Axis Values Y */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between font-label-sm text-label-sm text-tertiary pointer-events-none pr-space-xs">
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
                <span>0</span>
              </div>
              {/* Interactive Bar / Frequency Visualizer SVG */}
              <div className="ml-6 h-full flex items-end">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 700 160"
                >
                  <defs>
                    <linearGradient id="freqGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff5e1e" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#ff5e1e" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  {/* Baseline Grid Reference Line */}
                  <line
                    stroke="#404755"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                    x1="0"
                    x2="700"
                    y1="158"
                    y2="158"
                  ></line>
                  {/* Subtle dynamic track */}
                  <polyline
                    fill="url(#freqGrad)"
                    points={freqPoints}
                    stroke="#ff5e1e"
                    strokeWidth="2"
                  ></polyline>
                  {/* Interactive Day Focus Point */}
                  <circle className="fill-primary-container" cx="650" cy={todayPointY} r="5"></circle>
                  <circle
                    className="stroke-primary-container fill-none opacity-40 animate-ping"
                    cx="650"
                    cy={todayPointY}
                    r="9"
                  ></circle>
                </svg>
              </div>
              {/* Active Day Indicator Chip */}
              <div className="absolute right-4 bottom-8 bg-surface-container-high px-space-sm py-1 rounded shadow-lg flex flex-col items-center">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  Today ({chartDays[6]?.day ?? 'Fri'})
                </span>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  {chartDays[6]?.sessions ?? 0} sessions logged
                </span>
              </div>
            </div>
            {/* Days of Week X-Axis Labeling */}
            <div className="ml-6 grid grid-cols-7 pt-space-xs font-label-sm text-label-sm text-on-surface-variant text-center uppercase tracking-wider">
              {chartDays.map((item, idx) => (
                <span
                  key={`${item.day}-${idx}`}
                  className={item.isToday ? 'text-primary font-bold' : ''}
                >
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Progress Card (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between min-h-[340px] relative overflow-hidden">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Goal Progress
            </span>
            <Link
              className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              to="/settings"
            >
              <span className="material-symbols-outlined text-[18px]">north_east</span>
            </Link>
          </div>

          {data.goals.length > 0 ? (
            <div className="flex flex-col gap-space-sm my-auto py-space-sm">
              {data.goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg text-label-lg text-on-surface uppercase font-bold truncate">
                      {goal.name}
                    </span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">
                      {Math.round(goalProgress(goal))}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full"
                      style={{ width: `${goalProgress(goal)}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>
                      {goal.currentValue ?? 0} {goal.unit}
                    </span>
                    <span>
                      Target {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-space-sm my-auto">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[28px]">flag</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                Keep the signal
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Add an active target to render velocity arcs, weekly volume delta, and progressive
                overload metrics.
              </p>
            </div>
          )}

          {/* Miniature Target Archetype Pill List */}
          <div className="flex flex-col gap-space-xs pt-space-sm">
            <div className="bg-surface-container-low p-space-xs rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-on-surface uppercase">
                  Hypertrophy Cycle
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {data.goals.length ? `${data.goals.length} Active` : 'Unset'}
              </span>
            </div>
            <Link
              className="font-label-sm text-label-sm text-primary hover:text-on-surface flex items-center justify-between py-1 transition-colors uppercase font-bold"
              to="/settings"
            >
              <span>Manage goals</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row: Training Volume Tonnage & Recent Session Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Training Volume Distribution (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Training Volume
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-wide uppercase">
                The Work Adds Up
              </h2>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Calculated cumulative load from recorded weight x repetitions.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-surface-container-high font-label-sm text-label-sm text-secondary uppercase font-bold">
              Last 7 Days
            </span>
          </div>

          {/* Volume Bar Projection Area */}
          <div className="w-full flex-1 flex flex-col justify-end pt-space-md">
            <div className="relative w-full h-44">
              {/* Subtle Grid */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
                <div className="w-full h-[1px] bg-secondary"></div>
              </div>
              {/* Y-Axis Tonnage Scale */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between font-label-sm text-label-sm text-tertiary pointer-events-none pr-space-xs">
                <span>6k</span>
                <span>4k</span>
                <span>2k</span>
                <span>0</span>
              </div>
              {/* Multi-Bar Layout with Guides */}
              <div className="ml-6 h-full flex items-end justify-between px-space-md">
                {chartDays.map((item, idx) => {
                  const pct = item.volume > 0 ? Math.max(8, Math.round((item.volume / maxDayVolume) * 100)) : 0;
                  return (
                    <div key={`${item.day}-${idx}`} className="flex flex-col items-center gap-space-xs flex-1 h-full justify-end">
                      {item.isToday || item.volume > 0 ? (
                        <div
                          className="w-8 bg-primary-container/40 rounded-t flex items-start justify-center transition-all"
                          style={{ height: item.volume > 0 ? `${pct}%` : '12px' }}
                          title={`${item.volume} kg`}
                        >
                          <div className="w-full h-1 bg-primary-container"></div>
                        </div>
                      ) : (
                        <div className="w-8 bg-surface-container-high/60 rounded-t h-2"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Days of Week X-Axis */}
            <div className="ml-6 grid grid-cols-7 pt-space-xs font-label-sm text-label-sm text-on-surface-variant text-center uppercase tracking-wider">
              {chartDays.map((item, idx) => (
                <span
                  key={`${item.day}-${idx}`}
                  className={item.isToday ? 'text-primary font-bold' : ''}
                >
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions Ledger (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container/90 backdrop-blur-md p-space-md rounded-xl shadow-sm flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Recent Sessions
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-wide uppercase">
                Session Ledger
              </h2>
            </div>
            <Link
              className="font-label-sm text-label-sm text-primary hover:text-on-surface uppercase tracking-wider transition-colors font-bold"
              to="/history"
            >
              View all
            </Link>
          </div>

          {recent.length > 0 ? (
            <div className="flex-1 flex flex-col gap-space-xs my-space-xs overflow-y-auto">
              {recent.map((workout) => (
                <Link
                  key={workout.id}
                  to={`/log-workout?id=${workout.id}`}
                  className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low/70 hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                      <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                        {workout.name}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {formatDate(workout.workoutDate)} · {workout.exercises.length} exercises
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">
                      {formatDuration(workout.durationSeconds)}
                    </span>
                    <span className="font-label-sm text-label-sm text-primary">
                      {completedSets(workout).length} sets
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-space-md my-space-xs rounded-xl bg-surface-container-low/60">
              <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-space-sm">
                <span className="material-symbols-outlined text-[28px]">receipt_long</span>
              </div>
              <span className="font-label-lg text-label-lg text-on-surface uppercase font-bold tracking-wide">
                No sessions logged yet
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-1">
                When you complete a lifting or cardio workout, sets, reps, and RPE logs will display
                here.
              </p>
              <button
                onClick={() => navigate('/log-workout')}
                className="mt-space-md px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-all flex items-center gap-space-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  add_circle
                </span>
                <span>Initialize First Session</span>
              </button>
            </div>
          )}

          {/* Quick Ledger Footer */}
          <div className="flex items-center justify-between pt-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span>Log history sync: Ready</span>
            <span className="text-secondary">{data.workouts.length} items stored</span>
          </div>
        </div>
      </div>

      {/* Quick Action & Performance Routine Recommendations Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Quick Action 1: Muscle Target Overview */}
        <Link
          to="/log-workout"
          className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-md shadow-sm group hover:bg-surface-container transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
              Active Template
            </span>
            <span className="font-headline-md text-headline-md text-on-surface truncate uppercase">
              Push / Pull / Legs
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant truncate">
              3-day split rotation
            </span>
          </div>
        </Link>

        {/* Quick Action 2: Weight Tracker Shortcut */}
        <Link
          to="/measurements"
          className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-md shadow-sm group hover:bg-surface-container transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">straighten</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
              Body Metrics
            </span>
            <span className="font-headline-md text-headline-md text-on-surface truncate uppercase">
              Log Measurements
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant truncate">
              Waist, chest &amp; scale weight
            </span>
          </div>
        </Link>

        {/* Quick Action 3: PR Record Vault */}
        <Link
          to="/progress"
          className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-md shadow-sm group hover:bg-surface-container transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">military_tech</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
              Personal Records
            </span>
            <span className="font-headline-md text-headline-md text-on-surface truncate uppercase">
              PR Hall of Fame
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant truncate">
              Benchmark squat, bench &amp; deadlift
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
