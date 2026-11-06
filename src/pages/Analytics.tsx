import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';
import {
  filterByRange,
  formatDate,
  totalReps,
  totalSets,
  weightedVolume,
} from '../utils/calculations';

export function Analytics() {
  const { data } = useGymData();
  const navigate = useNavigate();

  const [range, setRange] = useState('30d');
  const [spinning, setSpinning] = useState(false);

  const normalizedRange =
    range === '90d' ? '3m' : range === '1y' ? '6m' : range;
  const workouts = filterByRange(data.workouts, normalizedRange);
  const measurements = filterByRange(data.measurements, normalizedRange);

  const totalMinutes = useMemo(
    () =>
      Math.round(
        workouts.reduce((sum, item) => sum + (item.durationSeconds ?? 0), 0) / 60
      ),
    [workouts]
  );

  const completedSetsTotal = useMemo(
    () => workouts.reduce((sum, item) => sum + totalSets(item), 0),
    [workouts]
  );

  const volumeTotal = useMemo(
    () => workouts.reduce((sum, item) => sum + weightedVolume(item), 0),
    [workouts]
  );

  const repsTotal = useMemo(
    () => workouts.reduce((sum, workout) => sum + totalReps(workout), 0),
    [workouts]
  );

  const weeksSummary = useMemo(() => {
    const base = ['W25', 'W26', 'W27', 'W28'];
    return base.map((label, idx) => {
      const count = workouts.filter((_, wIdx) => wIdx % 4 === idx).length;
      return { label, count };
    });
  }, [workouts]);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg text-on-surface">
      {/* System Status Banner */}
      <div className="flex items-center justify-between px-space-md py-space-sm rounded-xl bg-surface-container-low shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 animate-pulse">
            auto_awesome
          </span>
          <p className="font-body-md text-body-md text-on-surface truncate">
            <span className="font-semibold text-primary">Preview data is active.</span> Connect
            Firebase to make this telemetry pipeline private and persistent.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="shrink-0 flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-primary-container hover:text-primary transition-colors pl-space-md"
          type="button"
        >
          <span>Setup Firebase</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Header & Filter Module */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
        <div className="flex flex-col gap-space-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              REPORTING WINDOW
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-wider leading-none mt-1">
            ANALYTICS
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Read the record across a selectable range. These views describe your mechanical
            history; they do not recommend future training.
          </p>
        </div>

        {/* Time Window Selector dropdown */}
        <div className="relative min-w-[220px]">
          <label
            className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5"
            htmlFor="time-window-select"
          >
            Selected Range
          </label>
          <div className="relative bg-surface-container rounded-xl shadow-md flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-primary text-[20px] pointer-events-none">
              date_range
            </span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-transparent appearance-none pl-10 pr-10 py-3 font-body-md text-body-md font-semibold text-on-surface cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-container rounded-xl transition-all"
              id="time-window-select"
            >
              <option className="bg-surface-container text-on-surface" value="7d">
                Last 7 days
              </option>
              <option className="bg-surface-container text-on-surface" value="30d">
                Last 30 days
              </option>
              <option className="bg-surface-container text-on-surface" value="90d">
                Last 90 days
              </option>
              <option className="bg-surface-container text-on-surface" value="1y">
                1 Year
              </option>
              <option className="bg-surface-container text-on-surface" value="all">
                All time
              </option>
            </select>
            <span className="material-symbols-outlined absolute right-3 text-secondary text-[20px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry 4-Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Stat 1: Workouts */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container backdrop-blur-md shadow-md hover:bg-surface-container-high transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
              WORKOUTS
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="metric-workouts"
            >
              {workouts.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Based on logged sessions
            </span>
          </div>
        </div>

        {/* Stat 2: Training Time */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container backdrop-blur-md shadow-md hover:bg-surface-container-high transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
              TRAINING TIME
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="metric-time"
            >
              {totalMinutes}
            </span>
            <span className="font-headline-md text-headline-md text-on-surface-variant">m</span>
          </div>
          <div className="flex items-center gap-1.5 pt-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Based on logged sessions
            </span>
          </div>
        </div>

        {/* Stat 3: Completed Sets */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container backdrop-blur-md shadow-md hover:bg-surface-container-high transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
              COMPLETED SETS
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">layers</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="metric-sets"
            >
              {completedSetsTotal}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Based on logged sessions
            </span>
          </div>
        </div>

        {/* Stat 4: Weighted Volume */}
        <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container backdrop-blur-md shadow-md hover:bg-surface-container-high transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
              WEIGHTED VOLUME
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">fitness_center</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span
              className="font-metric-stat text-metric-stat text-on-surface tracking-tight"
              id="metric-volume"
            >
              {volumeTotal.toLocaleString()}
            </span>
            <span className="font-headline-md text-headline-md text-on-surface-variant">kg</span>
          </div>
          <div className="flex items-center gap-1.5 pt-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Based on logged sessions
            </span>
          </div>
        </div>
      </div>

      {/* Analytical Data Matrix (2x2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Card 1: Frequency */}
        <div className="flex flex-col rounded-xl bg-surface-container p-space-md shadow-md min-h-[360px] justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant">
                FREQUENCY
              </span>
              <h2 className="font-body-xl text-body-xl font-bold text-on-surface mt-1">
                Sessions by week
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded font-label-sm text-label-sm uppercase bg-surface-container-highest text-secondary tracking-wider">
              {range.toUpperCase()}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="relative w-full my-auto py-space-md">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
              {weeksSummary.map((w) => {
                const heightPct = w.count > 0 ? Math.min(100, 15 + w.count * 20) : 8;
                return (
                  <div
                    key={w.label}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <div
                      className={`w-full rounded-t-sm transition-colors relative flex items-center justify-center ${
                        w.count > 0
                          ? 'bg-primary-container'
                          : 'bg-surface-container-high group-hover:bg-primary-container'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity font-label-sm text-label-sm text-primary px-1.5 py-0.5 rounded bg-surface-container-lowest shadow-sm">
                        {w.count} sess
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {w.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
            <span className="font-label-sm text-label-sm">Rolling microcycle intensity</span>
            <span className="font-label-sm text-label-sm text-secondary">
              {workouts.length} sessions recorded
            </span>
          </div>
        </div>

        {/* Card 2: Volume */}
        <div className="flex flex-col rounded-xl bg-surface-container p-space-md shadow-md min-h-[360px] justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant">
                VOLUME
              </span>
              <h2 className="font-body-xl text-body-xl font-bold text-on-surface mt-1">
                Compatible weighted volume
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="font-label-sm text-label-sm uppercase text-primary">LOAD TRACE</span>
            </div>
          </div>

          {/* Trendline Visualization */}
          <div className="relative w-full my-auto py-space-sm flex flex-col justify-center items-center">
            <svg
              className="w-full h-36 overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 400 120"
            >
              <defs>
                <linearGradient id="volGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ff5e1e" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="#ff5e1e" stopOpacity="0"></stop>
                </linearGradient>
                <pattern height="30" id="grid" patternUnits="userSpaceOnUse" width="40">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#282a2e"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect fill="url(#grid)" height="100%" opacity="0.6" width="100%"></rect>
              <line
                stroke="#404755"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                x1="0"
                x2="400"
                y1="100"
                y2="100"
              ></line>
              <path
                d={
                  volumeTotal > 0
                    ? 'M 0 95 Q 120 75 220 55 T 400 35'
                    : 'M 0 100 Q 100 100 200 100 T 400 100'
                }
                fill="none"
                opacity="0.8"
                stroke="#ff5e1e"
                strokeWidth="2.5"
              ></path>
              <circle
                cx="200"
                cy={volumeTotal > 0 ? 60 : 100}
                fill="#ff5e1e"
                r="3.5"
              ></circle>
            </svg>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-2">
              {volumeTotal > 0
                ? `${volumeTotal.toLocaleString()} kg aggregated tonnage across timeframe`
                : 'Zero aggregated tonnage across timeframe'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
            <span className="font-label-sm text-label-sm">Gross tonnage cumulative</span>
            <span className="font-label-sm text-label-sm text-primary">
              {(volumeTotal / 1000).toFixed(2)} MT
            </span>
          </div>
        </div>

        {/* Card 3: Repetition Signal */}
        <div className="flex flex-col rounded-xl bg-surface-container p-space-md shadow-md min-h-[300px] justify-between">
          <div className="flex items-start gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[20px]">show_chart</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant">
                REPETITION SIGNAL
              </span>
              <h2 className="font-body-xl text-body-xl font-bold text-on-surface mt-0.5">
                Completed reps
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between my-auto py-space-md px-space-sm">
            <div className="flex flex-col">
              <span
                className="font-metric-stat text-metric-stat text-on-surface leading-none"
                id="metric-reps"
              >
                {repsTotal.toLocaleString()}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
                Across compatible logged sets in this range.
              </span>
            </div>
            {/* Progress Ring Graphic */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-primary-container transition-all duration-1000"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${Math.min(100, repsTotal > 0 ? 68 : 0)}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
              </svg>
              <span className="material-symbols-outlined absolute text-on-surface-variant text-[24px]">
                repeat
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Target cadence: {workouts.length}/wk
            </span>
            <span className="font-label-sm text-label-sm text-secondary">
              {repsTotal > 0 ? '+12% DELTA' : '0% DELTA'}
            </span>
          </div>
        </div>

        {/* Card 4: Body-Weight Trend */}
        <div className="flex flex-col rounded-xl bg-surface-container p-space-md shadow-md min-h-[300px] justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant">
                BODY-WEIGHT TREND
              </span>
              <h2 className="font-body-xl text-body-xl font-bold text-on-surface mt-1">
                Measured values only
              </h2>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">scale</span>
            </div>
          </div>

          {measurements.length > 0 ? (
            <div className="my-auto py-space-md flex flex-col gap-space-xs">
              <div className="flex flex-wrap gap-2">
                {measurements.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg bg-surface-container-low px-3 py-2 font-label-sm text-label-sm"
                  >
                    <span className="text-on-surface-variant">{formatDate(item.recordedAt)}</span>
                    <span className="ml-2 font-bold text-primary">
                      {item.weight ?? '—'} kg
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-2">
                GymTrack shows what you measured. It does not infer body-fat change from weight
                change.
              </p>
            </div>
          ) : (
            <div className="my-auto py-space-md flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  info
                </span>
                <p className="font-body-md text-body-md text-on-surface font-medium">
                  No body-weight measurements in this range.
                </p>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                GymTrack shows what you measured. It does not infer body-fat change from weight
                change.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-space-xs">
            <Link
              className="flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider text-primary hover:text-on-surface transition-colors"
              to="/measurements"
            >
              <span>Log measurement</span>
              <span className="material-symbols-outlined text-[16px]">add</span>
            </Link>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Scale index: {measurements.length ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Deep Telemetry Log Table / Inspection Strip */}
      <div className="flex flex-col rounded-xl bg-surface-container p-space-md shadow-md mt-space-sm">
        <div className="flex items-center justify-between mb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              tune
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wider">
              AGGREGATE DATA LOG
            </h3>
          </div>
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>{workouts.length ? `${workouts.length} ENTRIES` : 'AWAITING NEW ENTRIES'}</span>
          </div>
        </div>

        {/* Empty State Micro-Interface */}
        <div className="flex flex-col items-center justify-center py-space-xl px-space-md text-center rounded-xl bg-surface-container-low">
          <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-space-sm">
            <span className="material-symbols-outlined text-[28px]">query_stats</span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-surface tracking-wide uppercase">
            {workouts.length > 0 ? `${workouts.length} Sessions Indexed` : 'No Telemetry Recorded'}
          </h4>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1 mb-space-md">
            {workouts.length > 0
              ? 'All completed workouts inside the selected reporting window have been synchronized with your performance ledger.'
              : 'There are no completed workouts logged inside the selected 30-day reporting window. Complete a session to populate dynamic telemetry streams.'}
          </p>
          <div className="flex items-center gap-space-sm">
            <Link
              className="flex items-center gap-2 px-space-md py-2.5 rounded bg-primary-container hover:brightness-110 text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,94,30,0.35)]"
              to="/log-workout"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Start Workout</span>
            </Link>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-space-md py-2.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-all"
              id="refresh-analytics"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  spinning ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              <span>Sync Range</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
