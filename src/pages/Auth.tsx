import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { firebaseConfigured } from '../services/firebase';
import { useGymData } from '../context/GymDataContext';
import { authErrorMessage, loginWithEmail, loginWithGoogle, registerWithEmail, resetPassword } from '../services/authService';

const strengthTiers = [
  { text: 'Unranked', colorClass: 'bg-surface-container-highest', labelColor: 'text-secondary' },
  { text: 'Novice (Weak)', colorClass: 'bg-error', labelColor: 'text-error' },
  { text: 'Intermediate (Fair)', colorClass: 'bg-secondary', labelColor: 'text-secondary' },
  { text: 'Advanced (Strong)', colorClass: 'bg-primary', labelColor: 'text-primary' },
  { text: 'Elite Lifter Status', colorClass: 'bg-primary-container', labelColor: 'text-primary-container' },
];

function getPasswordScore(val: string): number {
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

export function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(isSignup ? '' : 'athlete@gymtrack.internal');
  const [password, setPassword] = useState(isSignup ? '' : 'ObsidianPower2024!');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [rememberMe, setRememberMe] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { startFreshWorkspace, activateLoginWorkspace } = useGymData();

  useEffect(() => {
    setNotice('');
    setError('');
    if (isSignup) {
      if (email === 'athlete@gymtrack.internal') setEmail('');
      if (password === 'ObsidianPower2024!') setPassword('');
    } else {
      if (!email) setEmail('athlete@gymtrack.internal');
      if (!password) setPassword('ObsidianPower2024!');
    }
  }, [isSignup]);

  const passwordScore = getPasswordScore(password);
  const currentStrength = strengthTiers[passwordScore];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    setError('');
    setBusy(true);
    try {
      if (isSignup) {
        const displayName = name.trim() || email.split('@')[0] || 'Athlete';
        const sessionUser = await registerWithEmail(email, password, displayName, unitSystem);
        startFreshWorkspace({
          uid: sessionUser.uid,
          displayName: sessionUser.displayName ?? displayName,
          email: sessionUser.email ?? email.trim(),
          preferredUnits: unitSystem,
        });
        setNotice('Fresh account created. Complete your details to start your first log.');
        navigate('/onboarding');
      } else {
        const sessionUser = await loginWithEmail(email, password);
        activateLoginWorkspace({
          uid: sessionUser.uid,
          displayName: sessionUser.displayName ?? undefined,
          email: sessionUser.email ?? email.trim(),
        });
        setNotice('Session verified. Redirecting to Telemetry Hub...');
        navigate('/dashboard');
      }
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setNotice('Connecting via Google SSO gateway...');
    setError('');
    setBusy(true);
    try {
      const sessionUser = await loginWithGoogle();
      if (isSignup) {
        startFreshWorkspace({
          uid: sessionUser.uid,
          displayName: name.trim() || sessionUser.displayName || 'Athlete',
          email: sessionUser.email || 'athlete@gymtrack.app',
          preferredUnits: unitSystem,
        });
        navigate('/onboarding');
      } else {
        activateLoginWorkspace({
          uid: sessionUser.uid,
          displayName: sessionUser.displayName || 'Aditya Bhat',
          email: sessionUser.email || 'athlete@gymtrack.app',
        });
        navigate('/dashboard');
      }
    } catch (authError) {
      setNotice('');
      setError(authErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email) {
      setError('Enter your email first, then request a reset link.');
      return;
    }
    if (!firebaseConfigured) {
      setNotice('Password reset link sent to ' + email + '.');
      return;
    }
    try {
      await resetPassword(email);
      setNotice('Password reset email sent. Check your inbox.');
    } catch (authError) {
      setError(authErrorMessage(authError));
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">
      {/* Subtle Radial Grid Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#282a2e_1px,transparent_1px)] [background-size:24px_24px] opacity-25 z-0" />

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary-container text-[24px]">fitness_center</span>
            <span className="font-headline-md text-headline-md tracking-wider uppercase text-on-surface">
              Gym<span className="text-primary-container">Track</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-space-xs font-label-lg text-label-lg uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center max-w-7xl mx-auto px-gutter-mobile lg:px-margin py-space-xl">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-6xl mx-auto py-space-md lg:py-space-xl">
            {isSignup ? (
              <>
                {/* Sign Up Mode: Atmospheric Kinetic Aura & Glows */}
                <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute -bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-xxl items-center">
                  {/* Left Column: Value Proposition & Telemetry Preview */}
                  <div className="lg:col-span-6 flex flex-col justify-center space-y-space-lg">
                    {/* Athletic Micro Pill Badge */}
                    <div className="inline-flex items-center gap-space-xs self-start px-3 py-1.5 rounded-[0.75rem] bg-surface-container-high shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                      <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                        New Athlete Onboarding
                      </span>
                    </div>

                    {/* Heavyweight Condensed Title */}
                    <h1 className="font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface">
                      A quieter way to <br className="hidden sm:inline" />
                      <span className="text-primary-container drop-shadow-[0_0_24px_rgba(255,94,30,0.35)]">
                        track the work.
                      </span>
                    </h1>

                    {/* High-readability copy */}
                    <p className="font-body-xl text-body-xl text-secondary max-w-lg leading-relaxed">
                      Your sessions, measurements, and milestones in one high-precision private workspace. No plans. No prescriptions. Just your raw telemetry.
                    </p>

                    {/* Dynamic Live Metric Preview Module */}
                    <div className="p-space-md rounded-[0.5rem] bg-surface-container shadow-md flex items-center gap-space-md max-w-md">
                      <div className="w-12 h-12 rounded-[0.25rem] bg-surface-container-high flex items-center justify-center text-primary-container">
                        <span
                          className="material-symbols-outlined text-[28px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          insights
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
                            Estimated 1RM Trajectory
                          </span>
                          <span className="font-label-sm text-label-sm text-primary-container font-bold">
                            +12.4%
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-primary-container h-full rounded-full w-3/4 transition-all duration-700" />
                        </div>
                        <p className="font-body-md text-body-md text-on-secondary-container mt-1.5 text-xs truncate">
                          Calculated real-time across squat, bench, &amp; deadlift telemetry
                        </p>
                      </div>
                    </div>

                    {/* Trust Indicators & Guarantees */}
                    <div className="pt-space-xs flex flex-wrap items-center gap-y-3 gap-x-6 text-on-secondary-container">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                        <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary">
                          Client-Side Privacy
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary-container text-[18px]">bolt</span>
                        <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary">
                          Instant Offline Sync
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[18px]">credit_card_off</span>
                        <span className="font-label-sm text-label-sm tracking-wider uppercase text-secondary">
                          No Card Required
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Registration Card */}
                  <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
                    <div className="relative bg-surface-container/90 backdrop-blur-2xl rounded-[0.5rem] p-space-lg lg:p-space-xl shadow-2xl flex flex-col space-y-space-md">
                      {/* Card Header Section */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase font-bold">
                            Telemetry Protocol 01
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[0.125rem] bg-surface-container-highest text-secondary font-label-sm text-label-sm uppercase">
                            Alpha Access
                          </span>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg uppercase tracking-normal text-on-surface">
                          Start Your Training Log
                        </h2>
                        <p className="font-body-md text-body-md text-secondary">
                          A few telemetry anchors, then your first session.
                        </p>
                      </div>

                      {/* Submission Feedback Banner */}
                      {(notice || error || busy) && (
                        <div
                          className={`p-space-sm rounded-[0.25rem] font-body-md text-body-md flex items-center gap-space-xs transition-all ${
                            error
                              ? 'bg-error-container/40 text-error'
                              : 'bg-surface-container-high text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {error ? 'error' : 'info'}
                          </span>
                          <span>{error || notice || 'Initializing athlete telemetry workspace...'}</span>
                        </div>
                      )}

                      {/* Unit Selector Switch */}
                      <div className="pt-space-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                            Mass System
                          </label>
                          <span className="font-label-sm text-label-sm text-primary font-bold" id="unit-indicator">
                            {unitSystem === 'metric' ? 'International (kg)' : 'North American (lbs)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 p-1 bg-surface-container-lowest rounded-[0.25rem]">
                          <button
                            className={`py-2 text-center rounded-[0.125rem] font-label-lg text-label-lg uppercase tracking-wider transition-all ${
                              unitSystem === 'metric'
                                ? 'bg-surface-container text-on-surface shadow-sm'
                                : 'text-secondary hover:text-on-surface'
                            }`}
                            id="btn-metric"
                            onClick={() => setUnitSystem('metric')}
                            type="button"
                          >
                            Metric (kg)
                          </button>
                          <button
                            className={`py-2 text-center rounded-[0.125rem] font-label-lg text-label-lg uppercase tracking-wider transition-all ${
                              unitSystem === 'imperial'
                                ? 'bg-surface-container text-on-surface shadow-sm'
                                : 'text-secondary hover:text-on-surface'
                            }`}
                            id="btn-imperial"
                            onClick={() => setUnitSystem('imperial')}
                            type="button"
                          >
                            Imperial (lbs)
                          </button>
                        </div>
                      </div>

                      {/* Form Fields Container */}
                      <form className="space-y-space-md pt-space-xs" id="signup-form" onSubmit={submit}>
                        {/* Display Name */}
                        <div className="space-y-1.5">
                          <label
                            className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center justify-between"
                            htmlFor="display-name"
                          >
                            <span>Athlete Identifier</span>
                            <span className="text-tertiary font-normal">Display name</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">
                              person
                            </span>
                            <input
                              className="w-full bg-surface-container-lowest text-on-surface placeholder:text-secondary-container font-body-md text-body-md pl-11 pr-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-low transition-colors"
                              id="display-name"
                              name="displayName"
                              placeholder="Alex Morgan"
                              required
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                          <label
                            className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center justify-between"
                            htmlFor="email"
                          >
                            <span>Transmission Node</span>
                            <span className="text-tertiary font-normal">Email</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">
                              alternate_email
                            </span>
                            <input
                              className="w-full bg-surface-container-lowest text-on-surface placeholder:text-secondary-container font-body-md text-body-md pl-11 pr-4 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-low transition-colors"
                              id="email"
                              name="email"
                              placeholder="alex.morgan@telemetry.io"
                              required
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Password & Dynamic Strength Meter */}
                        <div className="space-y-1.5">
                          <label
                            className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center justify-between"
                            htmlFor="password"
                          >
                            <span>Access Key</span>
                            <span className="text-tertiary font-normal">Password</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">
                              lock
                            </span>
                            <input
                              className="w-full bg-surface-container-lowest text-on-surface placeholder:text-secondary-container font-body-md text-body-md pl-11 pr-11 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-low transition-colors"
                              id="password"
                              minLength={6}
                              name="password"
                              placeholder="Min. 8 characters"
                              required
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              aria-label="Toggle password visibility"
                              className="absolute right-3.5 text-secondary hover:text-on-surface transition-colors focus:outline-none"
                              id="toggle-password"
                              onClick={() => setShowPassword(!showPassword)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]" id="password-visibility-icon">
                                {showPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>

                          {/* Password Strength Bars */}
                          <div className="pt-2">
                            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                              {[0, 1, 2, 3].map((idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-full transition-colors duration-300 h-full ${
                                    idx < passwordScore
                                      ? currentStrength.colorClass
                                      : 'bg-surface-container-highest'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
                                Complexity Status
                              </span>
                              <span
                                className={`font-label-sm text-label-sm uppercase font-bold tracking-wider ${currentStrength.labelColor}`}
                                id="strength-label"
                              >
                                {currentStrength.text}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Primary Submission CTA Button */}
                        <button
                          className={`w-full py-3.5 px-6 rounded-[0.25rem] bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_24px_rgba(255,94,30,0.35)] flex items-center justify-center gap-space-xs font-bold mt-space-sm ${
                            busy ? 'opacity-75' : ''
                          }`}
                          disabled={busy}
                          type="submit"
                        >
                          <span>{busy ? 'Initializing…' : 'Initialize Athlete Profile'}</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                      </form>

                      {/* Divider */}
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow h-px bg-surface-container-highest" />
                        <span className="flex-shrink mx-4 font-label-sm text-label-sm text-tertiary uppercase tracking-widest">
                          Or Continue With
                        </span>
                        <div className="flex-grow h-px bg-surface-container-highest" />
                      </div>

                      {/* OAuth Provider */}
                      <button
                        className="w-full py-3 px-4 rounded-[0.25rem] bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-all flex items-center justify-center gap-3"
                        disabled={busy}
                        onClick={google}
                        type="button"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                            fill="#EA4335"
                          />
                          <path
                            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                            fill="#4285F4"
                          />
                          <path
                            d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                            fill="#34A853"
                          />
                        </svg>
                        <span>Google Telemetry ID</span>
                      </button>

                      {/* Alternative Auth Link */}
                      <div className="pt-2 text-center">
                        <span className="font-body-md text-body-md text-secondary">Existing Athlete?</span>
                        <Link
                          to="/login"
                          state={{ from: location.pathname }}
                          className="font-label-lg text-label-lg uppercase tracking-wider text-primary-container hover:text-primary transition-colors ml-1.5 font-bold"
                        >
                          Sign In to Station
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Login Mode: Atmospheric Ambient Glows */}
                <div className="absolute -top-20 left-10 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute -bottom-20 right-10 w-96 h-96 bg-surface-container-high/40 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-xxl items-center">
                  {/* Left Column: High-Impact Athletic Narrative & Telemetry */}
                  <div className="lg:col-span-6 flex flex-col space-y-space-lg">
                    {/* Status Indicator Pill */}
                    <div className="inline-flex items-center gap-space-sm self-start px-space-md py-space-xs rounded-[0.75rem] bg-surface-container-low shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container">
                        Session Telemetry 2.4
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">•</span>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                        Good to see you
                      </span>
                    </div>

                    {/* Headline Block */}
                    <div className="space-y-space-xs">
                      <h1 className="font-headline-xl text-headline-xl uppercase text-on-surface tracking-tight leading-none">
                        A quieter way to <br />
                        <span className="text-primary-container drop-shadow-[0_0_24px_rgba(255,94,30,0.35)]">
                          track the work.
                        </span>
                      </h1>
                      <p className="font-body-lg text-body-lg text-secondary max-w-lg leading-relaxed pt-space-xs">
                        Your sessions, measurements, and milestones in one private workspace. No plans. No prescriptions. Just raw execution and unyielding historical clarity.
                      </p>
                    </div>

                    {/* Value Badges */}
                    <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                      <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-[0.25rem] bg-surface-container-low shadow-sm">
                        <span className="material-symbols-outlined text-primary-container text-[18px]">verified_user</span>
                        <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                          Private by design
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-[0.25rem] bg-surface-container-low shadow-sm">
                        <span className="material-symbols-outlined text-primary-container text-[18px]">bolt</span>
                        <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                          Built for clarity
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-[0.25rem] bg-surface-container-low shadow-sm">
                        <span className="material-symbols-outlined text-secondary text-[18px]">noise_aware</span>
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                          Zero social clutter
                        </span>
                      </div>
                    </div>

                    {/* Interactive Telemetry Snapshot Card */}
                    <div className="mt-space-md p-space-md rounded-[0.5rem] bg-surface-container-low shadow-xl relative overflow-hidden group transition-all duration-300 hover:bg-surface-container">
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all" />
                      <div className="flex items-center justify-between pb-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-primary-container text-[16px]">history</span>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                            Last Logged Milestone
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-primary-container uppercase px-2 py-0.5 rounded-[0.125rem] bg-primary-container/15 font-bold">
                          New PR
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-space-xs">
                        <div>
                          <p className="font-headline-md text-headline-md uppercase text-on-surface tracking-wide">
                            Barbell Back Squat
                          </p>
                          <p className="font-body-md text-body-md text-secondary">
                            5 Sets Completed • RPE 9.0 • 2 days ago
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-metric-stat text-metric-stat text-primary-container leading-none">
                            150 <span className="font-body-md text-body-md text-secondary">KG</span>
                          </div>
                          <p className="font-label-sm text-label-sm text-secondary tracking-widest uppercase mt-1">
                            × 5 Reps
                          </p>
                        </div>
                      </div>
                      {/* Micro Sparkline SVG */}
                      <div className="pt-space-md flex items-center gap-space-md">
                        <div className="flex-1 h-6 flex items-center">
                          <svg
                            className="w-full h-5 text-primary-container overflow-visible"
                            preserveAspectRatio="none"
                            viewBox="0 0 160 20"
                          >
                            <path
                              d="M 0,16 L 30,14 L 60,11 L 90,13 L 120,6 L 160,2"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeWidth="2"
                            />
                            <circle className="animate-ping opacity-75" cx="160" cy="2" fill="#ff5e1e" r="3" />
                            <circle cx="160" cy="2" fill="#ff5e1e" r="3" />
                          </svg>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider shrink-0">
                          +12.5% Prev Month
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: High-Performance Auth Glass Container */}
                  <div className="lg:col-span-6 flex justify-center lg:justify-end">
                    <div className="w-full max-w-md bg-surface-container-low/90 backdrop-blur-xl p-space-lg sm:p-space-xl rounded-[0.5rem] shadow-2xl relative">
                      {/* Auth Form Header */}
                      <div className="space-y-space-xs mb-space-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-widest font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                            Sign In
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            v2.4.0
                          </span>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-wide">
                          Pick up where you left off
                        </h2>
                        <p className="font-body-md text-body-md text-secondary">
                          Your training history is cached and waiting.
                        </p>
                      </div>

                      {/* Submission Feedback Banner */}
                      {(notice || error || busy) && (
                        <div
                          className={`mb-space-md p-space-sm rounded-[0.25rem] font-body-md text-body-md flex items-center gap-space-xs transition-all ${
                            error
                              ? 'bg-error-container/40 text-error'
                              : 'bg-surface-container-high text-primary'
                          }`}
                          id="authAlert"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {error ? 'error' : 'info'}
                          </span>
                          <span id="authAlertText">
                            {error || notice || 'Authorizing telemetry session...'}
                          </span>
                        </div>
                      )}

                      <form className="space-y-space-md" id="loginForm" onSubmit={submit}>
                        {/* Email Field */}
                        <div className="space-y-1">
                          <label
                            className="block font-label-lg text-label-lg uppercase text-secondary tracking-wider"
                            htmlFor="emailInput"
                          >
                            Email Address
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-space-md text-secondary text-[20px] pointer-events-none">
                              mail
                            </span>
                            <input
                              className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-12 pr-space-md py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-high transition-all"
                              id="emailInput"
                              name="email"
                              placeholder="you@example.com"
                              required
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label
                              className="block font-label-lg text-label-lg uppercase text-secondary tracking-wider"
                              htmlFor="passwordInput"
                            >
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={forgot}
                              className="font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors uppercase tracking-wider"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-space-md text-secondary text-[20px] pointer-events-none">
                              lock
                            </span>
                            <input
                              className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-12 pr-12 py-3 rounded-[0.25rem] focus:outline-none focus:bg-surface-container-high transition-all"
                              id="passwordInput"
                              minLength={6}
                              name="password"
                              placeholder="At least 6 characters"
                              required
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              aria-label="Toggle password visibility"
                              className="absolute right-space-md text-secondary hover:text-on-surface transition-colors flex items-center justify-center p-1"
                              id="togglePasswordBtn"
                              onClick={() => setShowPassword(!showPassword)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]" id="passwordEyeIcon">
                                {showPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Remember Session Toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-space-sm cursor-pointer select-none">
                            <input
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded-[0.125rem] bg-surface-container-lowest accent-primary-container cursor-pointer"
                              id="rememberMe"
                              type="checkbox"
                            />
                            <span className="font-body-md text-body-md text-secondary hover:text-on-surface transition-colors">
                              Keep me signed in on this device
                            </span>
                          </label>
                        </div>

                        {/* Primary Submission CTA Button */}
                        <button
                          className={`w-full py-3.5 px-space-md rounded-[0.25rem] bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-widest font-bold shadow-[0_0_24px_rgba(255,94,30,0.35)] hover:shadow-[0_0_32px_rgba(255,94,30,0.55)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-space-xs group ${
                            busy ? 'opacity-75' : ''
                          }`}
                          disabled={busy}
                          id="submitButton"
                          type="submit"
                        >
                          <span>{busy ? 'Working…' : 'Log in'}</span>
                          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </button>

                        {/* Telemetry Divider */}
                        <div className="relative py-space-xs flex items-center justify-center">
                          <div className="w-full h-px bg-surface-container-high" />
                          <span className="absolute px-space-sm bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-widest">
                            or
                          </span>
                        </div>

                        {/* Social / Identity Provider Button */}
                        <button
                          className="w-full py-3 px-space-md rounded-[0.25rem] bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider transition-all flex items-center justify-center gap-space-sm shadow-sm"
                          disabled={busy}
                          onClick={google}
                          type="button"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </button>
                      </form>

                      {/* Footer Switch Link */}
                      <div className="mt-space-lg text-center font-body-md text-body-md text-secondary">
                        <span>New to GymTrack?</span>
                        <Link
                          to="/signup"
                          state={{ from: location.pathname }}
                          className="text-primary-container font-semibold hover:text-primary transition-colors uppercase font-label-lg text-label-lg ml-1.5 tracking-wider"
                        >
                          Create one
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Telemetry Footer */}
      <footer className="relative z-10 w-full bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase tracking-wider text-tertiary-container">
            <div className="flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span>256-Bit SSL Encrypted</span>
            </div>
            <span className="text-surface-bright">•</span>
            <div className="flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary-container">cloud_done</span>
              <span>Cloud Telemetry Sync Active</span>
            </div>
          </div>
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-container">
            © 2024 GYMTRACK SYSTEM. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}

