import { useState } from 'react';
import { Check, Dumbbell, Flag, Ruler } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';

const goalOptions = [
  'Fat loss',
  'Weight gain',
  'Muscle building',
  'Strength improvement',
  'General fitness',
  'Workout consistency',
];

const equipmentOptions = [
  'Full gym',
  'Dumbbells',
  'Barbells and weight plates',
  'Machines',
  'Cable machines',
  'Resistance bands',
  'Kettlebells',
  'Pull-up bar',
  'Bodyweight only',
];

const genderOptions = [
  { value: 'Prefer not to say', label: 'Prefer not to say' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Self-describe', label: 'Other' },
];

export function Onboarding() {
  const { data, updateProfile } = useGymData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [savingStep, setSavingStep] = useState(false);

  const initialName =
    !data.profile.displayName ||
    data.profile.displayName === 'Alex Morgan' ||
    data.profile.displayName === 'Athlete'
      ? 'Aditya Bhat'
      : data.profile.displayName;

  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(String(data.profile.age ?? 28));
  const [gender, setGender] = useState(data.profile.gender ?? 'Prefer not to say');
  const [height, setHeight] = useState(String(data.profile.height ?? 178));
  const [weight, setWeight] = useState(String(data.profile.currentWeight ?? 78.4));
  const [goalWeight, setGoalWeight] = useState(String(data.profile.targetWeight ?? 72));
  const [goal, setGoal] = useState(data.profile.primaryGoal ?? 'Strength improvement');
  const [units, setUnits] = useState<'metric' | 'imperial'>(data.profile.preferredUnits ?? 'metric');
  const [equipment, setEquipment] = useState<string[]>(data.profile.equipmentAccess);

  const isMetric = units === 'metric';
  const weightUnit = isMetric ? 'kg' : 'lbs';
  const heightUnit = isMetric ? 'cm' : 'in';

  // Calculate live Target Delta for the preview card
  const numericWeight = parseFloat(weight);
  const numericGoalWeight = parseFloat(goalWeight);
  const hasValidWeights = !Number.isNaN(numericWeight) && !Number.isNaN(numericGoalWeight);
  const weightDelta = hasValidWeights ? Number((numericGoalWeight - numericWeight).toFixed(1)) : -6.4;
  const absDelta = Math.abs(weightDelta);
  const isCut = weightDelta < 0;
  const isGain = weightDelta > 0;
  const deltaSign = weightDelta > 0 ? '+' : '';
  const deltaPhaseLabel = isCut ? 'Lean cut' : isGain ? 'Mass build' : 'Maintenance';
  const estWeeksLow = Math.max(2, Math.round(absDelta / (isMetric ? 0.8 : 1.75)));
  const estWeeksHigh = Math.max(estWeeksLow + 2, Math.round(absDelta / (isMetric ? 0.64 : 1.4)));

  const toggleEquipment = (item: string) =>
    setEquipment((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );

  const handleStep1Submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSavingStep(true);
    updateProfile({
      displayName: name || 'Aditya Bhat',
      age: Number(age) || undefined,
      gender,
      height: Number(height) || undefined,
      currentWeight: Number(weight) || undefined,
      targetWeight: Number(goalWeight) || undefined,
      preferredUnits: units,
    });
    setTimeout(() => {
      setSavingStep(false);
      setStep(1);
    }, 350);
  };

  const finish = () => {
    updateProfile({
      displayName: name || 'Aditya Bhat',
      age: Number(age) || undefined,
      gender,
      height: Number(height) || undefined,
      currentWeight: Number(weight) || undefined,
      targetWeight: Number(goalWeight) || undefined,
      primaryGoal: goal,
      preferredUnits: units,
      equipmentAccess: equipment,
      onboardingCompleted: true,
    });
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen text-slate-100 font-sans antialiased selection:bg-brand-orange selection:text-white pb-16"
      style={{
        backgroundColor: '#0E1015',
        backgroundImage:
          'radial-gradient(ellipse at 50% 0%, rgba(255, 94, 30, 0.08) 0%, transparent 60%), linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 48px 48px, 48px 48px',
      }}
    >
      {/* BEGIN: MainHeader */}
      <header className="w-full max-w-5xl mx-auto pt-8 pb-4 px-4 sm:px-6 lg:px-8" data-purpose="site-navigation-header">
        <div className="flex items-center justify-between pb-6 border-b border-brand-border/60">
          {/* GymTrack Logo Lockup */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center font-display font-black text-xl text-black shadow-lg shadow-brand-orange/20 group-hover:scale-105 transition-transform duration-200">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-brand-orange transition-colors">
                Gym<span className="text-brand-orange">Track</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-muted">
                Performance Engine
              </span>
            </div>
          </Link>

          {/* Step Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
            </span>
            <span className="text-xs font-mono font-medium text-brand-steel">
              STEP <span className="text-white font-bold">{step + 1}</span> OF 4
            </span>
          </div>
        </div>

        {/* Stepper Navigation */}
        <nav aria-label="Onboarding Progress" className="mt-6">
          <ol className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
            {/* Step 1 */}
            <li className={`relative ${step === 0 ? '' : 'opacity-80 cursor-pointer'}`} onClick={() => setStep(0)}>
              <div
                className={
                  step === 0
                    ? 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/90 border border-brand-orange/40 shadow-sm shadow-brand-orange/10'
                    : 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/30 border border-brand-border'
                }
              >
                <div
                  className={
                    step === 0
                      ? 'w-7 h-7 rounded-lg bg-brand-orange text-black flex items-center justify-center font-bold text-xs shrink-0'
                      : 'w-7 h-7 rounded-lg bg-brand-input text-brand-orange flex items-center justify-center font-semibold text-xs shrink-0'
                  }
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      d="M15.75 6a3.75 3.75 0 11-7.0 0 3.75 3.75 0 017.0 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      step === 0 ? 'font-semibold text-brand-orange' : 'font-medium text-brand-steel'
                    }`}
                  >
                    01. You
                  </span>
                  <span className="text-[11px] text-brand-steel truncate">Athlete Profile</span>
                </div>
              </div>
            </li>

            {/* Step 2 */}
            <li
              className={`relative ${step === 1 ? '' : 'opacity-60 cursor-pointer'}`}
              onClick={() => setStep(1)}
            >
              <div
                className={
                  step === 1
                    ? 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/90 border border-brand-orange/40 shadow-sm shadow-brand-orange/10'
                    : 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/30 border border-brand-border'
                }
              >
                <div
                  className={
                    step === 1
                      ? 'w-7 h-7 rounded-lg bg-brand-orange text-black flex items-center justify-center font-bold text-xs shrink-0'
                      : 'w-7 h-7 rounded-lg bg-brand-input text-brand-steel flex items-center justify-center font-semibold text-xs shrink-0'
                  }
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      step === 1 ? 'font-semibold text-brand-orange' : 'font-medium text-brand-steel'
                    }`}
                  >
                    02. Goals
                  </span>
                  <span className="text-[11px] text-brand-muted truncate">Target &amp; Metrics</span>
                </div>
              </div>
            </li>

            {/* Step 3 */}
            <li
              className={`relative ${step === 2 ? '' : 'opacity-60 cursor-pointer'}`}
              onClick={() => setStep(2)}
            >
              <div
                className={
                  step === 2
                    ? 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/90 border border-brand-orange/40 shadow-sm shadow-brand-orange/10'
                    : 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/30 border border-brand-border'
                }
              >
                <div
                  className={
                    step === 2
                      ? 'w-7 h-7 rounded-lg bg-brand-orange text-black flex items-center justify-center font-bold text-xs shrink-0'
                      : 'w-7 h-7 rounded-lg bg-brand-input text-brand-steel flex items-center justify-center font-semibold text-xs shrink-0'
                  }
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      step === 2 ? 'font-semibold text-brand-orange' : 'font-medium text-brand-steel'
                    }`}
                  >
                    03. Access
                  </span>
                  <span className="text-[11px] text-brand-muted truncate">Gym Facilities</span>
                </div>
              </div>
            </li>

            {/* Step 4 */}
            <li
              className={`relative ${step === 3 ? '' : 'opacity-60 cursor-pointer'}`}
              onClick={() => setStep(3)}
            >
              <div
                className={
                  step === 3
                    ? 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/90 border border-brand-orange/40 shadow-sm shadow-brand-orange/10'
                    : 'flex items-center gap-3 p-2 rounded-xl bg-brand-surface/30 border border-brand-border'
                }
              >
                <div
                  className={
                    step === 3
                      ? 'w-7 h-7 rounded-lg bg-brand-orange text-black flex items-center justify-center font-bold text-xs shrink-0'
                      : 'w-7 h-7 rounded-lg bg-brand-input text-brand-steel flex items-center justify-center font-semibold text-xs shrink-0'
                  }
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      step === 3 ? 'font-semibold text-brand-orange' : 'font-medium text-brand-steel'
                    }`}
                  >
                    04. Review
                  </span>
                  <span className="text-[11px] text-brand-muted truncate">Confirmation</span>
                </div>
              </div>
            </li>
          </ol>
        </nav>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: MainContent */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 mt-4">
        {/* Form Card Container */}
        <div
          className="bg-brand-card/95 border border-brand-border rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden"
          data-purpose="onboarding-card"
        >
          {/* Top Decorative Glow Accent */}
          <div className="absolute -top-24 right-1/4 w-72 h-48 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

          {step === 0 && (
            <>
              {/* Card Sub-header & Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wide bg-brand-surface text-brand-orange border border-brand-orange/30">
                    STEP 01 • PERSONAL DETAILS
                  </span>
                  <span className="text-xs text-brand-muted hidden sm:inline">• Core Vitals</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-8">
                <h1
                  className="text-4xl sm:text-5xl uppercase tracking-wide text-white mb-2 leading-none"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  Start with the basics
                </h1>
                <p className="text-sm sm:text-base text-brand-steel font-normal leading-relaxed">
                  Tell us enough to make your progress history meaningful. You can edit everything later.
                </p>
              </div>

              {/* Form Elements */}
              <form className="space-y-6" id="vitalsForm" onSubmit={handleStep1Submit}>
                {/* Row 1: Full Name & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-8">
                    <label
                      className="block text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2"
                      htmlFor="fullName"
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-muted font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                        id="fullName"
                        name="fullName"
                        placeholder="e.g. Alex Morgan"
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div className="sm:col-span-4">
                    <label
                      className="block text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2"
                      htmlFor="age"
                    >
                      Age
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-muted font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                        id="age"
                        max="120"
                        min="14"
                        name="age"
                        placeholder="25"
                        required
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs text-brand-muted">
                        yrs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Gender & Preferred Units */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Gender Select */}
                  <div>
                    <label
                      className="block text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2"
                      htmlFor="gender"
                    >
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-10 cursor-pointer"
                        id="gender"
                        name="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        {genderOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-brand-steel">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Unit System Select / Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className="block text-xs font-semibold text-brand-steel uppercase tracking-wider"
                        htmlFor="preferredUnits"
                      >
                        Preferred units
                      </label>
                      <span className="text-[11px] font-mono text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded">
                        Standard
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-10 cursor-pointer"
                        id="preferredUnits"
                        name="preferredUnits"
                        value={units}
                        onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
                      >
                        <option value="metric">Metric · kg / cm</option>
                        <option value="imperial">Imperial · lbs / in</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-brand-steel">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Height & Current Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Height Input */}
                  <div>
                    <label
                      className="block text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2"
                      htmlFor="height"
                    >
                      Current height{' '}
                      <span className="text-brand-muted font-normal" id="heightUnitLabel">
                        ({heightUnit})
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-muted font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-12"
                        id="height"
                        name="height"
                        placeholder={isMetric ? '178' : '70'}
                        required
                        step="0.5"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-mono text-brand-steel">
                        {heightUnit}
                      </div>
                    </div>
                  </div>

                  {/* Current Weight Input */}
                  <div>
                    <label
                      className="block text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2"
                      htmlFor="weight"
                    >
                      Current weight{' '}
                      <span className="text-brand-muted font-normal" id="weightUnitLabel">
                        ({weightUnit})
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-muted font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-12"
                        id="weight"
                        name="weight"
                        placeholder={isMetric ? '78.4' : '173'}
                        required
                        step="0.1"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-mono text-brand-steel">
                        {weightUnit}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4: Goal Weight & Quick Metric Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2"
                      htmlFor="goalWeight"
                    >
                      Goal weight{' '}
                      <span className="text-brand-muted font-normal" id="goalUnitLabel">
                        ({weightUnit})
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-brand-input border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-muted font-medium transition duration-200 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-12"
                        id="goalWeight"
                        name="goalWeight"
                        placeholder={isMetric ? '72' : '158'}
                        required
                        step="0.1"
                        type="number"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-mono text-brand-steel">
                        {weightUnit}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-brand-muted flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-brand-orange inline shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Calculates target deficit and training phase intensity.
                    </p>
                  </div>

                  {/* Quick Metric Preview / Delta Card */}
                  <div className="hidden sm:flex flex-col justify-end">
                    <div className="p-3.5 rounded-xl bg-brand-input/70 border border-brand-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {isGain ? '↑' : isCut ? '↓' : '•'}
                        </div>
                        <div>
                          <span className="block text-[11px] font-mono text-brand-muted uppercase">
                            Target Delta
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {deltaSign}
                            {weightDelta} {weightUnit} {deltaPhaseLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-brand-steel px-2 py-1 rounded bg-brand-surface">
                        {absDelta === 0 ? 'ON TARGET' : `~${estWeeksLow}-${estWeeksHigh} WEEKS`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Actions Bar */}
                <div className="pt-6 mt-8 border-t border-brand-border/70 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  <button
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider text-brand-muted hover:text-white transition-colors flex items-center justify-center gap-2 hover:bg-brand-surface/60"
                    disabled
                    type="button"
                  >
                    <span>Cancel Onboarding</span>
                  </button>
                  <button
                    className="w-full sm:w-auto min-w-[160px] px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-display font-bold text-sm tracking-wide shadow-lg shadow-brand-orange/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    id="btnContinue"
                    type="submit"
                  >
                    {savingStep ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving Vitals...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <svg
                          className="w-4 h-4 stroke-[2.5]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
                  <Flag size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wide bg-brand-surface text-brand-orange border border-brand-orange/30">
                    STEP 02 • GOALS
                  </span>
                  <span className="text-xs text-brand-muted hidden sm:inline">• Target &amp; Metrics</span>
                </div>
              </div>
              <div className="mb-8">
                <h1
                  className="text-4xl sm:text-5xl uppercase tracking-wide text-white mb-2 leading-none"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  What are you tracking toward?
                </h1>
                <p className="text-sm sm:text-base text-brand-steel font-normal leading-relaxed">
                  Choose a direction for your stats. GymTrack will never turn this into a workout plan.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {goalOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoal(item)}
                    className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                      goal === item
                        ? 'border-brand-orange bg-brand-orange/10 text-white'
                        : 'border-brand-border bg-brand-input/60 text-brand-steel hover:border-brand-border-focus hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item}</span>
                      {goal === item && <Check size={16} className="text-brand-orange" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-6 mt-8 border-t border-brand-border/70 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider text-brand-steel hover:text-white transition-colors flex items-center justify-center gap-2 hover:bg-brand-surface/60"
                >
                  <span>← Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto min-w-[160px] px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-display font-bold text-sm tracking-wide shadow-lg shadow-brand-orange/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
                  <Dumbbell size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wide bg-brand-surface text-brand-orange border border-brand-orange/30">
                    STEP 03 • EQUIPMENT ACCESS
                  </span>
                  <span className="text-xs text-brand-muted hidden sm:inline">• Gym Facilities</span>
                </div>
              </div>
              <div className="mb-8">
                <h1
                  className="text-4xl sm:text-5xl uppercase tracking-wide text-white mb-2 leading-none"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  What can you use?
                </h1>
                <p className="text-sm sm:text-base text-brand-steel font-normal leading-relaxed">
                  This is a preference for filtering your record, not a prescription for what to do.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {equipmentOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                      equipment.includes(item)
                        ? 'border-brand-orange bg-brand-orange/10 text-white'
                        : 'border-brand-border bg-brand-input/60 text-brand-steel hover:border-brand-border-focus hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item}</span>
                      {equipment.includes(item) && <Check size={16} className="text-brand-orange" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-6 mt-8 border-t border-brand-border/70 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider text-brand-steel hover:text-white transition-colors flex items-center justify-center gap-2 hover:bg-brand-surface/60"
                >
                  <span>← Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto min-w-[160px] px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-display font-bold text-sm tracking-wide shadow-lg shadow-brand-orange/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
                  <Check size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wide bg-brand-surface text-brand-orange border border-brand-orange/30">
                    STEP 04 • REVIEW
                  </span>
                  <span className="text-xs text-brand-muted hidden sm:inline">• Confirmation</span>
                </div>
              </div>
              <div className="mb-8">
                <h1
                  className="text-4xl sm:text-5xl uppercase tracking-wide text-white mb-2 leading-none"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  Your starting point
                </h1>
                <p className="text-sm sm:text-base text-brand-steel font-normal leading-relaxed">
                  A quick look before we open your training journal.
                </p>
              </div>
              <div className="space-y-3">
                <ReviewRow label="Name" value={name || 'Not set'} />
                <ReviewRow label="Age / gender" value={`${age || '—'} · ${gender}`} />
                <ReviewRow
                  label="Height / weight"
                  value={`${height || '—'} ${heightUnit} / ${weight || '—'} ${weightUnit}`}
                />
                <ReviewRow label="Goal weight" value={`${goalWeight || '—'} ${weightUnit}`} />
                <ReviewRow label="Main focus" value={goal} />
                <ReviewRow label="Equipment" value={`${equipment.length} selected`} />
                <div className="rounded-xl border border-brand-orange/25 bg-brand-orange/[0.06] p-4 text-sm leading-6 text-brand-steel">
                  <Ruler size={16} className="mb-2 text-brand-orange" /> You can edit these preferences later. GymTrack tracks your choices and sessions — it does not generate training plans.
                </div>
              </div>
              <div className="pt-6 mt-8 border-t border-brand-border/70 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider text-brand-steel hover:text-white transition-colors flex items-center justify-center gap-2 hover:bg-brand-surface/60"
                >
                  <span>← Back</span>
                </button>
                <button
                  type="button"
                  onClick={finish}
                  className="w-full sm:w-auto min-w-[160px] px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-display font-bold text-sm tracking-wide shadow-lg shadow-brand-orange/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open my journal</span>
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & Privacy Tagline */}
        <div className="text-center mt-6">
          <p className="text-xs text-brand-muted inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-steel" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Data encrypted with zero third-party sharing. Calibrated for personal metrics only.
          </p>
        </div>
      </main>
      {/* END: MainContent */}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-input/60 px-4 py-3">
      <span className="text-xs text-brand-steel uppercase tracking-wider">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
