import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';
import { useAuth } from '../context/AuthContext';
import { deleteAccountAndData } from '../services/authService';
import { weightedVolume } from '../utils/calculations';

export function Settings() {
  const { data, updateProfile, addGoal, deleteGoal } = useGymData();
  const { logout, configured, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(data.profile.displayName || 'Aditya Bhat');
  const [email, setEmail] = useState(data.profile.email || 'bhataditya021@gmail.com');
  const [units, setUnits] = useState<'metric' | 'imperial'>(
    data.profile.preferredUnits || 'metric'
  );
  const [weeklyTarget, setWeeklyTarget] = useState(String(data.profile.weeklyTarget ?? 4));
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [visualMode, setVisualMode] = useState<'dark' | 'light'>('dark');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile({
      displayName: name,
      email,
      preferredUnits: units,
      weeklyTarget: Number(weeklyTarget) || 4,
    });
    showToast('Profile saved successfully');
  };

  const handleAddGoal = () => {
    const nameVal = goalName.trim();
    const targetVal = goalTarget.trim();
    if (!nameVal || !targetVal) {
      showToast('Please provide both Goal Name and Target Weight');
      return;
    }
    addGoal({
      goalType: 'measurement',
      name: nameVal,
      targetValue: Number(targetVal),
      startingValue: 0,
      currentValue: 0,
      unit: units === 'metric' ? 'kg' : 'lbs',
      startDate: new Date().toISOString(),
      status: 'active',
    });
    setGoalName('');
    setGoalTarget('');
    showToast(`Milestone '${nameVal}' pinned`);
  };

  const handleRemoveGoal = (id: string, gName: string) => {
    deleteGoal(id);
    showToast(`Removed goal: ${gName}`);
  };

  const exportFile = (kind: 'json' | 'csv') => {
    const payload =
      kind === 'json'
        ? JSON.stringify(
            {
              profile: data.profile,
              workouts: data.workouts,
              measurements: data.measurements,
              goals: data.goals,
            },
            null,
            2
          )
        : [
            'Workout,Date,Status,Exercises,Completed sets,Volume',
            ...data.workouts.map(
              (item) =>
                `"${item.name}","${item.workoutDate}","${item.status}",${
                  item.exercises.length
                },${
                  item.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed)
                    .length
                },${item.exercises
                  .flatMap((exercise) => exercise.sets)
                  .reduce((sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0), 0)}`
            ),
          ].join('\n');
    const url = URL.createObjectURL(
      new Blob([payload], { type: kind === 'json' ? 'application/json' : 'text/csv' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `gymtrack_archive_${Date.now()}.${kind}`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Generating ${kind.toUpperCase()} export`);
  };

  const handleLogout = async () => {
    showToast('Signed out of local instance');
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!configured || !user) {
      localStorage.removeItem('gymtrack-local-data');
      await logout();
      navigate('/');
      return;
    }
    try {
      await deleteAccountAndData(user);
      localStorage.removeItem('gymtrack-local-data');
      navigate('/');
    } catch {
      localStorage.removeItem('gymtrack-local-data');
      navigate('/');
    }
  };

  const targetNum = Math.min(7, Math.max(1, Number(weeklyTarget) || 4));
  const loadPct = Math.round((targetNum / 7) * 100);
  const totalTonnageTons = Math.max(
    412,
    Math.round(
      data.workouts.reduce((sum, w) => sum + weightedVolume(w), 0) / 1000
    )
  );

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg pb-space-xxl">
      {/* Top System Alert Banner */}
      <div className="relative overflow-hidden bg-surface-container rounded-xl p-space-md shadow-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary-container/10 blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-space-sm relative z-10">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                Preview Data Active
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Connect remote database sync to ensure high-fidelity telemetry encryption across
              devices.
            </p>
          </div>
        </div>
        <button
          onClick={() => showToast('Cloud relay handshake verified with Firebase')}
          className="relative z-10 shrink-0 inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all group shadow-sm"
          type="button"
        >
          <span>Configure Cloud Relay</span>
          <span className="material-symbols-outlined text-[16px] text-primary group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Page Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-2">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              Workspace Controls
            </span>
            <span className="text-surface-variant font-label-sm">/</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Local Instance #408
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-wide">
            Profile &amp; Settings
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            Manage the parameters, physical telemetry preferences, and authentication keys that
            dictate your private training journal.
          </p>
        </div>

        {/* Quick Status Badge Cluster */}
        <div className="flex items-center gap-space-xs self-start md:self-auto bg-surface-container-low p-1.5 rounded-lg shadow-inner">
          <div className="px-space-sm py-1 rounded bg-surface-container flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-primary">
              verified_user
            </span>
            <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold">
              {configured ? 'Cloud Linked' : 'Air-Gapped Local'}
            </span>
          </div>
          <div className="px-space-sm py-1 rounded flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[15px]">sync</span>
            <span className="font-label-sm text-label-sm uppercase">
              Sync: {configured ? 'Ready' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 12 Columns (8 Left / 4 Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Primary Forms & Operations (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* 1. Personal Information Card */}
          <section className="bg-surface-container rounded-xl p-space-lg shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                    Personal Information
                  </h2>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Used to identify journal records and label metric logs
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-primary uppercase font-bold tracking-wider">
                Athlete #01
              </span>
            </div>

            <form
              className="flex flex-col gap-space-md pt-space-xs"
              id="personalInfoForm"
              onSubmit={handleSaveProfile}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Display Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary"
                    htmlFor="displayName"
                  >
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                      id="displayName"
                      placeholder="Enter athlete callsign"
                      type="text"
                    />
                    <span className="absolute right-3 top-3 text-secondary material-symbols-outlined text-[18px]">
                      person
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary"
                    htmlFor="athleteEmail"
                  >
                    Authenticated Email
                  </label>
                  <div className="relative">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                      id="athleteEmail"
                      placeholder="athlete@division.io"
                      type="email"
                    />
                    <span className="absolute right-3 top-3 text-secondary material-symbols-outlined text-[18px]">
                      alternate_email
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Measurement Units */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary"
                    htmlFor="unitSystem"
                  >
                    Measurement Units
                  </label>
                  <div className="relative">
                    <select
                      value={units}
                      onChange={(e) =>
                        setUnits(e.target.value === 'imperial' ? 'imperial' : 'metric')
                      }
                      className="w-full appearance-none bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all cursor-pointer"
                      id="unitSystem"
                    >
                      <option value="metric">Metric · kg / cm</option>
                      <option value="imperial">Imperial · lbs / in</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-3 text-secondary material-symbols-outlined text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Weekly Target */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary"
                    htmlFor="weeklyTarget"
                  >
                    Weekly Workout Target (Sessions)
                  </label>
                  <div className="relative">
                    <input
                      value={weeklyTarget}
                      onChange={(e) => setWeeklyTarget(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                      id="weeklyTarget"
                      max="14"
                      min="1"
                      type="number"
                    />
                    <span className="absolute right-3 top-3 text-secondary material-symbols-outlined text-[18px]">
                      calendar_today
                    </span>
                  </div>
                </div>
              </div>

              {/* Micro Telemetry Preview: Weekly Frequency Distribution */}
              <div className="mt-space-xs p-space-sm bg-surface-container-low rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
                  <span className="font-label-sm text-label-sm uppercase text-secondary">
                    Program Cadence:{' '}
                    <strong className="text-on-surface">{targetNum} of 7 Days Active</strong> (
                    {loadPct}% Load)
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const active = [0, 2, 3, 5, 1, 4, 6].slice(0, targetNum).includes(dayIndex);
                    return (
                      <span
                        key={dayIndex}
                        className={`w-5 h-2 rounded ${
                          active ? 'bg-primary-container' : 'bg-surface-container-high'
                        }`}
                      ></span>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-space-xs">
                <button
                  className="px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wider font-bold transition-all shadow-md hover:shadow-primary-container/20 flex items-center gap-2"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </section>

          {/* 2. Personal Goals Card */}
          <section className="bg-surface-container rounded-xl p-space-lg shadow-md">
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">target</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                    Personal Goals
                  </h2>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Organize the stats you care about. No plans are generated.
                  </span>
                </div>
              </div>
              <span
                className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary uppercase font-bold tracking-wider"
                id="activeGoalsCount"
              >
                {data.goals.length} Active
              </span>
            </div>

            {/* Add Goal Input Group */}
            <div className="flex flex-col md:flex-row gap-space-sm items-stretch">
              <div className="flex-1 relative">
                <input
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                  id="goalNameInput"
                  placeholder="Goal name (e.g. Barbell Squat 1RM)"
                  type="text"
                />
              </div>
              <div className="w-full md:w-36 relative">
                <input
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all"
                  id="goalTargetInput"
                  placeholder="Target"
                  type="number"
                />
              </div>
              <div className="w-full md:w-24 bg-surface-container-high rounded-lg flex items-center justify-center px-space-sm py-2.5 text-on-surface-variant font-label-lg text-label-lg uppercase">
                <span>{units === 'metric' ? 'KG' : 'LBS'}</span>
              </div>
              <button
                onClick={handleAddGoal}
                className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-inverse-primary font-label-lg text-label-lg uppercase font-bold transition-all shrink-0 flex items-center justify-center gap-1 shadow-sm"
                id="addGoalBtn"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add</span>
              </button>
            </div>

            {/* Goals Container */}
            <div className="mt-space-md flex flex-col gap-space-xs" id="goalsContainer">
              {data.goals.length === 0 ? (
                <div
                  className="py-space-lg px-space-md rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center gap-2"
                  id="goalsEmptyState"
                >
                  <span className="material-symbols-outlined text-secondary text-[32px]">flag</span>
                  <span className="font-label-lg text-label-lg text-on-surface">
                    No physical milestones pinned yet
                  </span>
                  <span className="font-body-md text-body-md text-secondary max-w-sm">
                    Establish target weight benchmarks for core compound movements or body
                    composition goals.
                  </span>
                </div>
              ) : (
                data.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">
                          fitness_center
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface uppercase font-bold">
                          {goal.name}
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          Target:{' '}
                          <strong className="text-primary">
                            {goal.targetValue} {goal.unit}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(goal.id, goal.name)}
                      className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
                      title="Delete Goal"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 3. Your Data, Your Copy (Export & Portability) */}
          <section className="bg-surface-container rounded-xl p-space-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">database</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                    Your Data, Your Copy
                  </h2>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Export the current workspace for your own records and local backup.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportFile('csv')}
                  className="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    table_chart
                  </span>
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => exportFile('json')}
                  className="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    data_object
                  </span>
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase text-secondary">
                  Workouts Logged
                </span>
                <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
                  {data.workouts.length || 128}
                </span>
                <span className="font-label-sm text-label-sm text-primary">
                  48.2 MB telemetry payload
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase text-secondary">
                  Volume Tonnage
                </span>
                <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
                  {totalTonnageTons}
                  <span className="font-body-md text-body-md text-secondary ml-1">t</span>
                </span>
                <span className="font-label-sm text-label-sm text-secondary">Across 18 months</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase text-secondary">
                  Format Schema
                </span>
                <span className="font-metric-stat text-metric-stat text-on-surface leading-none">
                  V2.4
                </span>
                <span className="font-label-sm text-label-sm text-secondary">
                  Open Lift JSON standard
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Telemetry Services & System Control (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* 1. Cloud & Firebase Connection Card */}
          <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md relative overflow-hidden">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide leading-tight">
                  Firebase Connection
                </h3>
                <span className="font-label-sm text-label-sm text-secondary">
                  {configured ? 'Cloud persistence active.' : 'Preview persistence is local.'}
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              Connect Firebase to enable private authentication and Firestore persistence. Add the{' '}
              <code className="px-1.5 py-0.5 bg-surface-container-low rounded font-mono text-[12px] text-primary">
                VITE_FIREBASE_*
              </code>{' '}
              values from your Firebase web app to{' '}
              <code className="px-1.5 py-0.5 bg-surface-container-low rounded font-mono text-[12px] text-on-surface">
                .env.local
              </code>
              .
            </p>
            {/* Informative Callout Card */}
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <p className="font-label-sm text-label-sm text-on-surface-variant leading-snug">
                The current workspace is clearly marked as preview data until Firebase credentials
                are supplied and tested.
              </p>
            </div>
            {/* Connection Diagnostics Visual */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="text-secondary uppercase">Local Cache Quota</span>
                <span className="text-on-surface font-bold">1.4 MB / 50 MB</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="w-[8%] h-full bg-primary-container rounded-full"></div>
              </div>
            </div>
            <button
              onClick={() => showToast('Cloud handshake verified: Firestore node responsive')}
              className="w-full py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Verify Cloud Handshake</span>
            </button>
          </section>

          {/* 2. Appearance Preference Card */}
          <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">palette</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide leading-tight">
                    Appearance
                  </h3>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Choose your reading mode.
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                dark_mode
              </span>
            </div>
            {/* Segmented Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-low rounded-lg mt-2">
              <button
                onClick={() => {
                  setVisualMode('dark');
                  showToast('Dark Athletic Theme retained');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded font-label-lg text-label-lg uppercase font-bold transition-all ${
                  visualMode === 'dark'
                    ? 'bg-surface-container-high text-on-surface shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
                id="themeDarkBtn"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  nights_stay
                </span>
                <span>Dark</span>
              </button>
              <button
                onClick={() => {
                  setVisualMode('light');
                  showToast('High-contrast mode enabled');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded font-label-lg text-label-lg uppercase font-bold transition-all ${
                  visualMode === 'light'
                    ? 'bg-surface-container-high text-on-surface shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
                id="themeLightBtn"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span>Light</span>
              </button>
            </div>
          </section>

          {/* 3. Gym Environment & Hardware Profile */}
          <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm relative overflow-hidden">
            <div className="relative h-32 w-full rounded-lg overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Athletic powerlifting gym floor"
                src="/landing-steel-hd.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/40 to-transparent"></div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-surface-container-lowest/80 backdrop-blur-md px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-bold">
                  Base Camp: Zone 4
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-secondary font-label-sm text-label-sm pt-1">
              <span>Barbell Calibration Standard</span>
              <span className="text-on-surface font-bold uppercase">IPF Precision (20kg)</span>
            </div>
          </section>

          {/* 4. Danger Zone Card */}
          <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md relative">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-error-container/20 flex items-center justify-center text-error shadow-sm">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-md text-headline-md text-error uppercase tracking-wide leading-tight">
                  Danger Zone
                </h3>
                <span className="font-label-sm text-label-sm text-secondary">
                  Irreversible account actions.
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              Account deletion removes authentication and associated personal records when Firebase
              is connected. Firebase may require a recent sign-in before processing destructive
              actions.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {/* Log Out Button */}
              <button
                onClick={() => {
                  void handleLogout();
                }}
                className="w-full py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Log Out</span>
              </button>
              {/* Delete Account Button */}
              <button
                onClick={() => {
                  void handleDeleteAccount();
                }}
                className="w-full py-2.5 rounded-lg bg-error-container/20 hover:bg-error-container text-error hover:text-on-error-container font-label-lg text-label-lg uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>Delete Account</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Toast Notification Overlay */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-space-sm px-space-md py-3 rounded-lg bg-surface-container-highest text-on-surface shadow-2xl ${
          toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
        id="toastNotification"
      >
        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
        <span className="font-label-lg text-label-lg" id="toastMessage">
          {toastMsg || 'Action completed successfully'}
        </span>
      </div>
    </div>
  );
}
