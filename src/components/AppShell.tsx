import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, CalendarDays, ChevronRight, Dumbbell, History, Menu, Ruler, Settings, Sparkles, X } from 'lucide-react';
import { useGymData } from '../context/GymDataContext';
import { cn, StatusPill } from './ui';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/log-workout', label: 'Log workout', icon: Dumbbell, accent: true },
  { to: '/history', label: 'Workout history', icon: History },
  { to: '/progress', label: 'Exercise progress', icon: Activity },
  { to: '/measurements', label: 'Body measurements', icon: Ruler },
  { to: '/analytics', label: 'Analytics', icon: CalendarDays },
  { to: '/settings', label: 'Profile & settings', icon: Settings },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data, isPreview } = useGymData();
  const navigate = useNavigate();
  const location = useLocation();
  const close = () => setMobileOpen(false);
  const nav = <>
    <div className="flex items-center gap-3 px-4 py-2 md:px-5"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-ink shadow-[0_0_24px_rgba(200,245,58,.22)]"><span className="text-xl font-black">G</span></div><div><div className="text-sm font-black tracking-tight text-white">Gym<span className="text-lime">Track</span></div><div className="text-[9px] uppercase tracking-[0.2em] text-muted">performance log</div></div></div>
    <div className="mt-8 px-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted/70">Workspace</div><nav className="space-y-1">{navItems.map(({ to, label, icon: Icon, accent }) => <NavLink key={to} to={to} onClick={close} className={({ isActive }) => cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition', isActive ? 'bg-white/[0.07] text-white' : 'text-muted hover:bg-white/[0.04] hover:text-white', accent && !isActive && 'text-lime/90')}>{({ isActive }) => <><Icon size={17} strokeWidth={1.8} /><span className="flex-1">{label}</span>{to === '/log-workout' && <span className="rounded-md bg-lime/15 px-1.5 py-0.5 text-[9px] font-bold text-lime">NEW</span>}{isActive && <ChevronRight size={14} className="text-lime" />}</>}</NavLink>)}</nav></div>
    <div className="mt-auto p-3"><div className="rounded-2xl border border-line bg-panel/70 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Profile status</span><StatusPill tone={isPreview ? 'amber' : 'lime'}>{isPreview ? 'Preview' : 'Synced'}</StatusPill></div><p className="text-sm font-semibold text-white">{data.profile.displayName}</p><p className="mt-1 truncate text-xs text-muted">{data.profile.email}</p><button onClick={() => navigate('/settings')} className="mt-4 text-xs font-semibold text-lime hover:text-white">Manage profile <span aria-hidden>→</span></button></div></div>
  </>;
  return <div className="min-h-screen max-w-full overflow-x-hidden bg-ink text-white"><aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-ink/95 py-5 md:flex">{nav}</aside><div className="min-w-0 md:pl-[248px]"><header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur-xl md:px-8"><button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-muted hover:bg-white/5 hover:text-white md:hidden" aria-label="Open navigation"><Menu size={21} /></button><div className="hidden items-center gap-2 text-xs text-muted md:flex"><span className="h-1.5 w-1.5 rounded-full bg-lime" /> Private training journal <span className="text-line">/</span> {location.pathname === '/dashboard' ? 'Overview' : location.pathname.replace('/', '').replace('-', ' ')}</div><div className="ml-auto flex items-center gap-3"><button onClick={() => navigate('/settings')} className="hidden text-right sm:block"><div className="text-xs font-semibold text-white">{data.profile.displayName}</div><div className="text-[10px] text-muted">{isPreview ? 'Preview workspace' : 'Firestore synced'}</div></button><div className="flex h-9 w-9 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-xs font-bold text-lime">{data.profile.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div></div></header><main className="min-h-[calc(100vh-70px)] min-w-0 px-4 py-7 md:px-8 md:py-10 lg:px-10">{isPreview && <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-xs text-amber-100"><div className="flex min-w-0 items-start gap-2"><Sparkles size={15} className="mt-0.5 shrink-0 text-amber-300" /><span><strong>Preview data is active.</strong> Connect Firebase to make this workspace private and persistent.</span></div><button onClick={() => navigate('/settings')} className="shrink-0 font-bold text-amber-200 hover:text-white">Setup Firebase →</button></div>}<Outlet /></main></div>{mobileOpen && <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={close}><aside onClick={(event) => event.stopPropagation()} className="flex h-full w-[min(280px,calc(100vw-52px))] flex-col border-r border-line bg-ink py-5">{nav}<button onClick={close} className="absolute left-[calc(min(280px,100vw-52px)+12px)] top-5 rounded-xl bg-panel p-2 text-muted"><X size={18} /></button></aside></div>}</div>;
}
