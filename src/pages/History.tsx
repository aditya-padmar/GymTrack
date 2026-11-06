import { useMemo, useState } from 'react';
import { Copy, Edit3, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';
import { formatDate, formatDuration, totalSets, weightedVolume } from '../utils/calculations';

export function History() {
  const { data, deleteWorkout, addWorkout } = useGymData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [range, setRange] = useState('all');
  const [category, setCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const workouts = useMemo(
    () =>
      [...data.workouts]
        .filter((workout) => {
          const workoutDay = workout.workoutDate.slice(0, 10);
          const text = `${workout.name} ${workout.exercises
            .map((exercise) => `${exercise.name} ${exercise.muscleGroup ?? ''} ${exercise.equipment}`)
            .join(' ')}`.toLowerCase();
          const matchesSearch = text.includes(search.toLowerCase());
          const matchesCategory =
            category === 'all' ||
            (workout.category ?? '').toLowerCase() === category.toLowerCase() ||
            text.includes(category.toLowerCase());
          const days =
            range === 'week'
              ? 7
              : range === 'month'
              ? 30
              : range === 'mesocycle'
              ? 90
              : range === 'year'
              ? 365
              : 99999;
          const matchesRange =
            Date.now() - new Date(workout.workoutDate).getTime() <= days * 86400000;
          const matchesDate = !selectedDate || workoutDay === selectedDate;
          return matchesSearch && matchesCategory && matchesRange && matchesDate;
        })
        .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime()),
    [data.workouts, search, range, category, selectedDate]
  );

  const grossTonnage = useMemo(
    () => data.workouts.reduce((sum, w) => sum + weightedVolume(w), 0),
    [data.workouts]
  );

  const activeDaysCount = useMemo(() => {
    const days = new Set(data.workouts.map((w) => w.workoutDate.slice(0, 10)));
    return days.size;
  }, [data.workouts]);

  const duplicate = (id: string) => {
    const workout = data.workouts.find((item) => item.id === id);
    if (workout) {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = workout;
      addWorkout({
        ...copy,
        name: `${workout.name} copy`,
        workoutDate: new Date().toISOString(),
        status: 'draft',
      });
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedDate('');
    setRange('all');
    setCategory('all');
  };

  const rangeLabel =
    range === 'week'
      ? 'Past 7 Days'
      : range === 'month'
      ? 'Past 30 Days'
      : range === 'mesocycle'
      ? 'Current Cycle'
      : range === 'year'
      ? 'Year to Date'
      : 'All Time';

  const catLabel =
    category === 'all'
      ? 'All Disciplines'
      : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-space-lg">
        {/* Persistence Alert Banner */}
        <div className="w-full bg-surface-container/60 backdrop-blur-md px-space-md py-space-sm rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <span
              className="material-symbols-outlined text-primary-container text-[20px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <p className="font-body-md text-body-md text-on-surface truncate">
              <span className="font-semibold text-primary">Preview data is active.</span>
              <span className="text-on-surface-variant">
                {' '}
                Connect database storage to make this session ledger fully persistent across
                athletic devices.
              </span>
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors shrink-0 uppercase tracking-widest pl-space-sm"
            to="/settings"
          >
            <span>Setup Cloud Sync</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Title & Action Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                SESSION LEDGER
              </span>
              <span className="text-outline-variant font-label-sm">/</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                ARCHIVE VAULT
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-wide leading-none mt-1">
              WORKOUT HISTORY
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Choose any day to check telemetry, mechanical load, and recorded reps.
            </p>
          </div>
          {/* Quick Action Button */}
          <div className="shrink-0 flex items-center gap-space-sm">
            <button
              onClick={() => navigate('/log-workout')}
              className="group relative px-space-lg py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider flex items-center gap-space-xs shadow-[0_0_24px_rgba(255,94,30,0.35)] hover:shadow-[0_0_32px_rgba(255,94,30,0.6)] hover:brightness-110 active:scale-[0.98] transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
                add
              </span>
              <span>Log Workout</span>
            </button>
          </div>
        </div>

        {/* Metric Snapshot Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          <div className="bg-surface-container/70 backdrop-blur-md p-space-md rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
                RECORDED LOGS
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                inventory_2
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-2">
              <span className="font-metric-stat text-metric-stat text-on-surface">
                {data.workouts.length}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase">
                TOTAL
              </span>
            </div>
          </div>

          <div className="bg-surface-container/70 backdrop-blur-md p-space-md rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
                STREAK PACE
              </span>
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                local_fire_department
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-2">
              <span className="font-metric-stat text-metric-stat text-primary-container">
                {activeDaysCount}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase">
                DAYS ACTIVE
              </span>
            </div>
          </div>

          <div className="bg-surface-container/70 backdrop-blur-md p-space-md rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
                GROSS TONNAGE
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                scale
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-2">
              <span className="font-metric-stat text-metric-stat text-on-surface">
                {grossTonnage > 0 ? grossTonnage.toFixed(1) : '0.0'}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase">
                KG DISPLACED
              </span>
            </div>
          </div>

          <div className="bg-surface-container/70 backdrop-blur-md p-space-md rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
                CURRENT CYCLE
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                calendar_view_week
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mt-2">
              <span className="font-metric-stat text-metric-stat text-primary">W28</span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase">
                MESOCYCLE
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="bg-surface-container-low/90 backdrop-blur-md p-space-md rounded-xl flex flex-col lg:flex-row gap-space-md items-stretch shadow-md">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface placeholder:text-on-surface-variant/70 pl-11 pr-space-md rounded-lg font-body-md text-body-md transition-colors outline-none focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container"
              id="search-input"
              placeholder="Search workouts, exercises, muscles, or equipment"
              type="text"
            />
          </div>

          {/* Auxiliary Filter Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm lg:w-auto">
            {/* Date Picker Filter */}
            <div className="relative min-w-[170px]">
              <div className="h-12 bg-surface-container-highest/60 hover:bg-surface-container-highest rounded-lg px-space-md flex items-center justify-between cursor-pointer transition-colors focus-within:bg-surface-container-highest focus-within:ring-1 focus-within:ring-primary-container">
                <input
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/70 font-body-md text-body-md outline-none cursor-pointer"
                  id="date-filter"
                  placeholder="dd-mm-yyyy"
                  type="date"
                />
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 ml-2">
                  calendar_today
                </span>
              </div>
            </div>

            {/* Range / All Time Dropdown */}
            <div className="relative min-w-[150px]">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full h-12 appearance-none bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface px-space-md pr-9 rounded-lg font-body-md text-body-md cursor-pointer outline-none transition-colors focus:ring-1 focus:ring-primary-container"
                id="time-range-select"
              >
                <option className="bg-surface-container-high text-on-surface" value="all">
                  All time
                </option>
                <option className="bg-surface-container-high text-on-surface" value="week">
                  Past 7 days
                </option>
                <option className="bg-surface-container-high text-on-surface" value="month">
                  Past 30 days
                </option>
                <option className="bg-surface-container-high text-on-surface" value="mesocycle">
                  Current Cycle
                </option>
                <option className="bg-surface-container-high text-on-surface" value="year">
                  Year to date
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-space-sm flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[160px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 appearance-none bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface px-space-md pr-9 rounded-lg font-body-md text-body-md cursor-pointer outline-none transition-colors focus:ring-1 focus:ring-primary-container"
                id="category-select"
              >
                <option className="bg-surface-container-high text-on-surface" value="all">
                  All categories
                </option>
                <option className="bg-surface-container-high text-on-surface" value="Strength">
                  Strength
                </option>
                <option className="bg-surface-container-high text-on-surface" value="push">
                  Push Day
                </option>
                <option className="bg-surface-container-high text-on-surface" value="pull">
                  Pull Day
                </option>
                <option className="bg-surface-container-high text-on-surface" value="legs">
                  Legs / Lower
                </option>
                <option className="bg-surface-container-high text-on-surface" value="Cardio">
                  Conditioning / HIIT
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-space-sm flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Strip (Micro Chips) */}
        <div className="flex items-center justify-between flex-wrap gap-space-sm px-space-xs">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              ACTIVE PARAMS:
            </span>
            <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
              <span>Range: {rangeLabel}</span>
              <button
                type="button"
                onClick={() => setRange('all')}
                className="material-symbols-outlined text-[14px] text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                close
              </button>
            </span>
            <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
              <span>Cat: {catLabel}</span>
              <button
                type="button"
                onClick={() => setCategory('all')}
                className="material-symbols-outlined text-[14px] text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                close
              </button>
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="font-label-sm text-label-sm text-primary hover:underline uppercase tracking-wider ml-space-xs"
              id="reset-filters-btn"
            >
              Clear Filters
            </button>
          </div>
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>INDEX ORDER: CHRONOLOGICAL DESC</span>
          </div>
        </div>

        {/* Main Content Area: Session Feed Canvas or Empty State */}
        {workouts.length > 0 ? (
          <div className="rounded-2xl bg-surface-container-low/90 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="hidden md:grid grid-cols-[1.4fr_.8fr_.7fr_.7fr_.6fr_120px] gap-4 border-b border-surface-container-highest px-space-lg py-space-sm font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              <span>Session</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Sets</span>
              <span>Volume</span>
              <span />
            </div>
            <div className="divide-y divide-surface-container-highest">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="grid gap-3 px-space-lg py-space-md transition hover:bg-surface-container-high/50 md:grid-cols-[1.4fr_.8fr_.7fr_.7fr_.6fr_120px] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-space-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/log-workout?id=${workout.id}`}
                        className="block truncate font-label-lg text-label-lg font-bold text-on-surface hover:text-primary"
                      >
                        {workout.name}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                        <span>{workout.exercises.length} exercises</span>
                        <span>·</span>
                        <span className="uppercase text-primary">{workout.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {formatDate(workout.workoutDate, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="font-body-md text-body-md text-on-surface-variant">
                    {formatDuration(workout.durationSeconds)}
                  </div>
                  <div className="font-body-md text-body-md text-on-surface-variant">
                    {totalSets(workout)} completed
                  </div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">
                    {weightedVolume(workout)
                      ? `${weightedVolume(workout).toLocaleString()} kg`
                      : '—'}
                  </div>
                  <div className="flex gap-1 md:justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/log-workout?id=${workout.id}`)}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                      aria-label="Edit workout"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(workout.id)}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                      aria-label="Duplicate workout"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWorkout(workout.id)}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container/30 hover:text-error"
                      aria-label="Delete workout"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full rounded-2xl bg-surface-container-low/70 backdrop-blur-xl min-h-[460px] flex flex-col items-center justify-center p-space-xl overflow-hidden shadow-xl">
            {/* Ambient Visual Elements & Subtle Telemetry Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    height="40"
                    id="telemetry-grid"
                    patternUnits="userSpaceOnUse"
                    width="40"
                  >
                    <path
                      className="text-outline-variant"
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    ></path>
                  </pattern>
                </defs>
                <rect fill="url(#telemetry-grid)" height="100%" width="100%"></rect>
              </svg>
            </div>
            {/* Ambient Orange Center Radial Glow */}
            <div className="absolute w-96 h-96 rounded-full bg-primary-container/10 filter blur-[90px] pointer-events-none"></div>

            {/* Empty State Card Content */}
            <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center">
              {/* Telemetry Status Beacon */}
              <div className="relative mb-space-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container shadow-[0_0_28px_rgba(255,94,30,0.25)]">
                  <span className="material-symbols-outlined text-[32px]">fitness_center</span>
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary-container border-2 border-surface-container-lowest animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary-container border-2 border-surface-container-lowest"></span>
              </div>

              {/* Headline & Copy */}
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-wide">
                NO SESSIONS MATCH THAT FILTER
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs leading-relaxed max-w-sm">
                Try a different search or date range, or log a new session to initiate your
                performance ledger.
              </p>

              {/* Centered High-Voltage CTA */}
              <div className="mt-space-lg w-full flex flex-col sm:flex-row items-center justify-center gap-space-sm">
                <button
                  onClick={() => navigate('/log-workout')}
                  className="w-full sm:w-auto px-space-xl py-3.5 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider font-bold shadow-[0_0_24px_rgba(255,94,30,0.4)] hover:shadow-[0_0_36px_rgba(255,94,30,0.7)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span>Log Your First Workout</span>
                </button>
                <button
                  onClick={resetFilters}
                  className="w-full sm:w-auto px-space-md py-3.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                  <span>Reset Criteria</span>
                </button>
              </div>

              {/* Micro Telemetry Metadata Footer within the Canvas */}
              <div className="mt-space-xl pt-space-md flex items-center justify-center gap-space-md text-outline-variant font-label-sm text-label-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  <span className="text-on-secondary-container">BUFFER: 0 BYTES</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  <span className="text-on-secondary-container">STATUS: READY FOR INPUT</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Suggestion Panels / Quick Starter Templates */}
        <div className="flex flex-col gap-space-sm pt-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">flash_on</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-semibold">
                QUICK LAUNCH WORKOUT ROUTINES
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              PRECONFIGURED CIRCUITS
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Template 1 */}
            <div
              onClick={() => navigate('/log-workout')}
              className="group bg-surface-container/60 hover:bg-surface-container-high transition-all p-space-md rounded-xl flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-space-md min-w-0">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">vertical_align_top</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-headline-md text-on-surface tracking-wider leading-none truncate">
                    HEAVY PUSH A
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-1">
                    Bench • OHP • Triceps Dip
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all">
                chevron_right
              </span>
            </div>

            {/* Template 2 */}
            <div
              onClick={() => navigate('/log-workout')}
              className="group bg-surface-container/60 hover:bg-surface-container-high transition-all p-space-md rounded-xl flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-space-md min-w-0">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">
                    airline_seat_recline_extra
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-headline-md text-on-surface tracking-wider leading-none truncate">
                    DEADLIFT &amp; BACK B
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-1">
                    Deadlift • Pullups • Rows
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all">
                chevron_right
              </span>
            </div>

            {/* Template 3 */}
            <div
              onClick={() => navigate('/log-workout')}
              className="group bg-surface-container/60 hover:bg-surface-container-high transition-all p-space-md rounded-xl flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-space-md min-w-0">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">downhill_skiing</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-headline-md text-on-surface tracking-wider leading-none truncate">
                    LOWER POWER C
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-1">
                    Squat • RDL • Calves
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all">
                chevron_right
              </span>
            </div>
          </div>
        </div>

        {/* Ledger Footer Telemetry Readout */}
        <div className="pt-space-xs pb-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">filter_list</span>
            <span className="text-on-surface tracking-wider uppercase font-semibold">
              Showing {workouts.length} of {data.workouts.length} logged sessions
            </span>
          </div>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
              <span className="text-secondary tracking-widest uppercase">AUTO-SYNC: STANDBY</span>
            </div>
            <span className="text-surface-bright">|</span>
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="text-primary hover:text-on-surface transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <span>Telemetry diagnostics</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
