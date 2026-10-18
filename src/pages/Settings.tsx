import { useState } from 'react';
import { Download, Moon, Plus, Save, ShieldCheck, Sun, Trash2, UserRound } from 'lucide-react';
import { useGymData } from '../context/GymDataContext';
import { useAuth } from '../context/AuthContext';
import { firebaseSetupMessage } from '../services/firebase';
import { Button, Card, Input, SectionTitle, Select, StatusPill } from '../components/ui';
import { goalProgress } from '../utils/calculations';

export function Settings() {
  const { data, updateProfile, addGoal, deleteGoal } = useGymData();
  const { logout, configured } = useAuth();
  const [name, setName] = useState(data.profile.displayName);
  const [units, setUnits] = useState(data.profile.preferredUnits);
  const [weeklyTarget, setWeeklyTarget] = useState(String(data.profile.weeklyTarget ?? 4));
  const [saved, setSaved] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('kg');
  const [light, setLight] = useState(false);

  const saveProfile = () => {
    updateProfile({ displayName: name, preferredUnits: units, weeklyTarget: Number(weeklyTarget) || undefined });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  const exportFile = (kind: 'json' | 'csv') => {
    const payload = kind === 'json'
      ? JSON.stringify({ profile: data.profile, workouts: data.workouts, measurements: data.measurements, goals: data.goals }, null, 2)
      : ['Workout,Date,Status,Exercises,Completed sets,Volume', ...data.workouts.map((item) => `"${item.name}","${item.workoutDate}","${item.status}",${item.exercises.length},${item.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed).length},${item.exercises.flatMap((exercise) => exercise.sets).reduce((sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0), 0)}`)].join('\n');
    const url = URL.createObjectURL(new Blob([payload], { type: kind === 'json' ? 'application/json' : 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = `gymtrack-export.${kind}`; link.click(); URL.revokeObjectURL(url);
  };
  const createGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!goalName || !goalTarget) return;
    addGoal({ goalType: 'measurement', name: goalName, targetValue: Number(goalTarget), startingValue: 0, currentValue: 0, unit: goalUnit, startDate: new Date().toISOString(), status: 'active' });
    setGoalName(''); setGoalTarget('');
  };

  return <div className="mx-auto max-w-[1100px]">
    <SectionTitle eyebrow="Workspace controls" title="Profile & settings" description="Manage the details and preferences that shape your private training record." />
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3 border-b border-line pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime"><UserRound size={18} /></div><div><h3 className="font-semibold">Personal information</h3><p className="mt-1 text-xs text-muted">Used to identify your journal and label exports.</p></div></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-semibold text-muted">Display name</span><Input value={name} onChange={(event) => setName(event.target.value)} /></label><label><span className="mb-2 block text-xs font-semibold text-muted">Email</span><Input value={data.profile.email} disabled className="opacity-60" /></label><label><span className="mb-2 block text-xs font-semibold text-muted">Measurement units</span><Select value={units} onChange={(event) => setUnits(event.target.value as 'metric' | 'imperial')}><option value="metric">Metric · kg / cm</option><option value="imperial">Imperial · lb / ft</option></Select></label><label><span className="mb-2 block text-xs font-semibold text-muted">Weekly workout target</span><Input type="number" value={weeklyTarget} onChange={(event) => setWeeklyTarget(event.target.value)} /></label></div>
          <div className="mt-5 flex items-center justify-end gap-3">{saved && <span className="text-xs font-semibold text-lime">Saved</span>}<Button onClick={saveProfile}><Save size={15} /> Save profile</Button></div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-line pb-5"><div><h3 className="font-semibold">Personal goals</h3><p className="mt-1 text-xs text-muted">Organize the stats you care about. No plans are generated.</p></div><StatusPill>{data.goals.length} active</StatusPill></div>
          <div className="mt-5 space-y-3">{data.goals.map((goal) => <div key={goal.id} className="rounded-xl border border-line bg-ink/30 p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-semibold">{goal.name}</div><div className="mt-1 text-[11px] text-muted">{goal.currentValue ?? 0} / {goal.targetValue} {goal.unit}</div></div><button onClick={() => deleteGoal(goal.id)} className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} /></button></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime" style={{ width: `${goalProgress(goal)}%` }} /></div></div>)}</div>
          <form onSubmit={createGoal} className="mt-5 grid gap-3 sm:grid-cols-[1fr_120px_100px_auto]"><Input value={goalName} onChange={(event) => setGoalName(event.target.value)} placeholder="Goal name" required /><Input type="number" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} placeholder="Target" required /><Input value={goalUnit} onChange={(event) => setGoalUnit(event.target.value)} placeholder="Unit" /><Button type="submit"><Plus size={15} /> Add</Button></form>
        </Card>
        <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime"><Download size={18} /></div><div><h3 className="font-semibold">Your data, your copy</h3><p className="mt-1 text-xs text-muted">Export the current workspace for your own records.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => exportFile('csv')}>Export CSV</Button><Button variant="secondary" onClick={() => exportFile('json')}>Export JSON</Button></div></Card>
      </div>
      <aside className="space-y-5">
        <Card className="p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime"><ShieldCheck size={18} /></div><div><div className="text-sm font-semibold">Firebase connection</div><div className="mt-1 text-xs text-muted">Preview persistence is local.</div></div></div><p className="mt-4 text-xs leading-5 text-muted">{firebaseSetupMessage}</p><div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">The current workspace is clearly marked as preview data until Firebase credentials are supplied and tested.</div></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold">Appearance</div><div className="mt-1 text-xs text-muted">Choose your reading mode.</div></div><button onClick={() => setLight(!light)} className="rounded-xl border border-line p-2 text-muted hover:text-white" aria-label="Toggle appearance">{light ? <Sun size={16} /> : <Moon size={16} />}</button></div><div className="mt-4 flex gap-2"><button onClick={() => setLight(false)} className={`flex-1 rounded-xl border px-3 py-2 text-xs ${!light ? 'border-lime bg-lime/10 text-lime' : 'border-line text-muted'}`}>Dark</button><button onClick={() => setLight(true)} className={`flex-1 rounded-xl border px-3 py-2 text-xs ${light ? 'border-lime bg-lime/10 text-lime' : 'border-line text-muted'}`}>Light</button></div></Card>
        <Card className="border-red-500/20 p-5"><div className="text-sm font-semibold text-red-200">Danger zone</div><p className="mt-2 text-xs leading-5 text-muted">Account deletion will remove authentication and associated personal records once Firebase is connected.</p><Button variant="secondary" className="mt-4 w-full" onClick={() => { void logout(); }}>Log out</Button><Button variant="danger" className="mt-2 w-full" onClick={() => window.alert(configured ? 'Account deletion requires a verified Firebase Cloud Function or trusted server flow.' : 'Account deletion is available after Firebase is connected and verified.')}>Delete account</Button></Card>
      </aside>
    </div>
  </div>;
}
