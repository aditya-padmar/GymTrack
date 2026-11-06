import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGymData } from '../context/GymDataContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/log-workout', label: 'Log Workout', icon: 'add_circle', badge: 'NEW' },
  { to: '/history', label: 'Workout History', icon: 'history' },
  { to: '/progress', label: 'Exercise Progress', icon: 'trending_up' },
  { to: '/measurements', label: 'Body Measurements', icon: 'straighten' },
  { to: '/analytics', label: 'Analytics', icon: 'monitoring' },
  { to: '/settings', label: 'Profile & Settings', icon: 'settings' },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useGymData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const displayName = data.profile.displayName || 'Aditya Bhat';
  const email = data.profile.email || 'aditya.bhat@athletic.io';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AB';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="flex flex-col gap-space-lg">
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-space-sm px-space-xs py-space-xs"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_0_20px_rgba(255,94,30,0.45)]">
            <span className="material-symbols-outlined text-[22px]">fitness_center</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md tracking-wider text-on-surface leading-none">
              GYMTRACK
            </span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              Performance Log
            </span>
          </div>
        </Link>

        <div className="flex flex-col gap-space-xs">
          <div className="px-space-xs py-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Workspace
            </span>
          </div>
          <nav className="flex flex-col gap-space-xs">
            {navItems.map(({ to, label, icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center justify-between px-space-sm py-space-sm transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-[0_0_20px_rgba(255,94,30,0.25)] font-body-md text-body-md'
                    : 'flex items-center justify-between px-space-sm py-space-sm rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all'
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                      <span>{label}</span>
                    </div>
                    {badge && (
                      <span
                        className={`font-label-sm text-label-sm px-1.5 py-0.5 rounded font-bold tracking-wider ${
                          isActive
                            ? 'bg-surface-container-lowest/25 text-on-primary-container'
                            : 'bg-primary-container text-on-primary-container'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-space-sm rounded-xl bg-surface-container/80 backdrop-blur-md flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
            <span className="font-label-sm text-label-sm uppercase text-primary">PRO ATHLETE</span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary">Lvl 42</span>
        </div>
        <div className="flex items-center gap-space-sm pt-space-xs">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-label-lg text-label-lg font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-label-lg font-bold text-on-surface truncate leading-tight">
              {displayName}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
              {email}
            </span>
          </div>
        </div>
        <div className="pt-space-xs flex items-center justify-between">
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className="font-label-sm text-label-sm text-primary hover:text-on-surface transition-colors flex items-center gap-0.5"
          >
            <span>Manage profile</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            title="Log out"
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer text-[18px]"
          >
            logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-surface-container-low/90 backdrop-blur-xl z-50 flex-col justify-between p-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="fixed left-0 top-0 h-full w-72 bg-surface-container-low/95 backdrop-blur-xl z-50 flex flex-col justify-between p-space-md shadow-2xl"
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="md:pl-72">
        <header className="fixed top-0 left-0 md:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-gutter shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
            <nav className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="text-on-surface-variant">ATHLETE HUB</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface uppercase">PERFORMANCE CONSOLE</span>
            </nav>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span className="font-label-sm text-label-sm text-on-surface">WEEK 28 DAY 4</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => navigate('/analytics')}
                className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant flex items-center justify-center transition-colors"
                type="button"
                title="Telemetry Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button
                onClick={() => navigate('/history')}
                className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant flex items-center justify-center transition-colors"
                type="button"
                title="Search Workouts"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                type="button"
                title="Profile & Settings"
              >
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </button>
            </div>
          </div>
        </header>

        <main className="w-full pt-16 bg-surface-container-lowest px-gutter py-space-lg min-h-screen">
          {/* Quick Page Switcher on narrow viewports */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-space-md mb-space-sm">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
