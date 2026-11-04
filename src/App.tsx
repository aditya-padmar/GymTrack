import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymDataProvider, useGymData } from './context/GymDataContext';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { LogWorkout } from './pages/LogWorkout';
import { History } from './pages/History';
import { Progress } from './pages/Progress';
import { Measurements } from './pages/Measurements';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export default function App() {
  return <AuthProvider><GymDataProvider><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Auth mode="login" />} /><Route path="/signup" element={<Auth mode="signup" />} /><Route path="/onboarding" element={<Onboarding />} /><Route element={<ProtectedLayout />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/log-workout" element={<LogWorkout />} /><Route path="/history" element={<History />} /><Route path="/progress" element={<Progress />} /><Route path="/measurements" element={<Measurements />} /><Route path="/analytics" element={<Analytics />} /><Route path="/settings" element={<Settings />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></GymDataProvider></AuthProvider>;
}

function ProtectedLayout() {
  const { user, loading, configured } = useAuth(); const { data } = useGymData(); const location = useLocation();
  if (configured && loading) return <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-muted">Loading your private journal…</div>;
  if (configured && !user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (configured && user && !data.profile.onboardingCompleted && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return <AppShell />;
}
