import { Activity, ArrowRight, BarChart3, Check, Dumbbell, Gauge, LockKeyhole, ShieldCheck, Timer, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const shots = [
  { label: 'BARBELL WORKFLOW', title: 'Knurled steel discipline', className: 'landing-shot landing-shot-steel', src: '/landing-steel.jpg' },
  { label: 'MAXIMAL READOUT', title: 'Calculated volume', className: 'landing-shot landing-shot-volume', src: '/landing-volume.jpg' },
  { label: 'NO DISTRACTIONS', title: 'Every set counted', className: 'landing-shot landing-shot-form', src: '/landing-form.jpg' },
];

const comparisonRows = [
  ['Data ownership & privacy', 'Monetized, shared with third-party fitness ad networks', '100% client-side encrypted & zero data broker leaks'],
  ['Workout routine autonomy', 'Rigid cookie-cutter algorithms push locked programs', 'Complete freedom: Barbell, dumbbell, cables, or micro-plates'],
  ['Speed of set entry in the gym', 'Slow 6-tap menus, pop-up upsells, animated celebration screens', 'One-tap repetition and load entry under 2 seconds'],
  ['Social noise & feed clutter', 'Influencer feeds, community challenges, badge spam', 'Silent, dark-mode cockpit for athletes who execute'],
];

export function Landing() {
  return <div className="landing-page min-h-screen overflow-hidden bg-[#0c0d0f] text-white">
    <header className="landing-header">
      <Link to="/" className="landing-wordmark"><span className="landing-mark">G</span><span>GYMTRACK</span></Link>
      <nav className="landing-nav">
        <a href="#features">Features</a><a href="#preview">Interactive preview</a><a href="#analytics">Analytics</a><a href="#pricing">Pricing</a><a href="#compare">Terminology</a>
      </nav>
      <div className="landing-header-actions"><Link to="/login" className="landing-login">Log in</Link><Link to="/signup" className="landing-button landing-button-orange">Start tracking free <ArrowRight size={13} /></Link><span className="landing-avatar">A</span></div>
    </header>

    <main>
      <section className="landing-hero">
        <div className="landing-eyebrow"><span /> TELEMETRY SYSTEM v2.4 // READY FOR PRODUCTION</div>
        <h1>LOG THE WORK. <em>SEE THE PROGRESS.</em></h1>
        <p className="landing-hero-copy">GymTrack is your private performance log for workouts you actually do.<br className="hidden sm:block" /> Record weights, sets, reps, and let the evidence stack up. Zero fluff. Zero unsolicited routines.</p>
        <div className="landing-hero-actions"><Link to="/signup" className="landing-button landing-button-orange">Start tracking free <ArrowRight size={14} /></Link><Link to="/dashboard" className="landing-button landing-button-dark"><span className="landing-play">▶</span> Explore live demo</Link></div>
        <div className="landing-proof-row"><span><Check size={12} /> No workout plan pushes</span><span><LockKeyhole size={12} /> 100% private by design</span><span><TrendingUp size={12} /> Pure progress overload</span></div>
      </section>

      <section id="preview" className="landing-telemetry-wrap">
        <div className="landing-telemetry-top"><span><i className="landing-status-dot" /> Active session // hypertrophy A <b className="hidden sm:inline">| Started: 07:14 AM</b></span><span><Timer size={12} /> Rest timer <strong>01:45</strong></span></div>
        <div className="landing-telemetry-tabs"><span className="active">Barbell bench press</span><span>Barbell back squat</span><span>Romanian deadlift</span></div>
        <div className="landing-telemetry-grid">
          <div className="landing-set-panel"><div className="landing-panel-kicker">LAST RECORDED SESSION</div><div className="landing-metric-row"><strong>122.5 <small>KG</small></strong><span>Target rep range<br /><b>8.0–9.0</b></span><span>Prev session vol<br /><b>2,480 kg</b></span></div><div className="landing-set-table"><span>SET</span><span>PREVIOUS</span><span>TARGET</span><span>REPS</span><span>STATUS</span>{[['1','100.0 x 8','100.0','8','✓'],['2','105.0 x 6','105.0','6','✓'],['3','110.0 x 4','110.0','4','○']].map((row) => row.map((value, index) => <span key={`${row[0]}-${index}`} className={index === 4 ? 'set-status' : ''}>{value}</span>))}</div><button className="landing-add-set">+ ADD SET</button><div className="landing-note">◎ Every checkbox is yours to mark completed</div></div>
          <div className="landing-volume-panel"><div className="landing-panel-kicker">TRAINING DISPLACEMENT</div><strong>5,842 <small>KG</small></strong><div className="landing-bars">{[28,44,36,65,52,84,62].map((height, i) => <span key={i} style={{ height: `${height}%` }} className={i === 5 ? 'hot' : ''} />)}</div><div className="landing-chart-meta"><span>RPE avg<br /><b>8.4</b></span><span>Vs. last 7-day avg<br /><b className="orange-text">+9.4%</b></span></div></div>
        </div>
      </section>

      <section className="landing-shot-grid">{shots.map((shot) => <div key={shot.title} className={shot.className} style={{ backgroundImage: `url(${shot.src})` }}><div className="landing-shot-overlay"><span>{shot.label}</span><strong>{shot.title}</strong></div></div>)}</section>

      <section id="features" className="landing-section landing-record-section"><div className="landing-section-heading"><div><span className="landing-section-kicker">ENGINEERED CLARITY</span><h2>A CLEARER RECORD.<br /><em>WITHOUT THE NOISE.</em></h2></div><p>Most apps treat weightlifting like a cartoon game. GymTrack gives you mechanical precision and zero advertisements.</p></div><div className="landing-feature-grid"><Feature icon={Dumbbell} index="01 // TELEMETRY CAPTURE" title="Log your sessions fast" text="Capture exercises, sets, reps, exact RPE values, rest countdowns, and set-specific notes within seconds. Designed to be tapped with chalk on your thumbs without confusing submenus." /><Feature icon={TrendingUp} index="02 // HISTORICAL AUDIT" title="Compare performance" text="See what you lifted last week, 3 months ago, or last winter for the exact same repetition scheme. Automatic 1RM overlays reveal true micro-gains." /><Feature icon={BarChart3} index="03 // VOLUME MATHEMATICS" title="Read the trend" text="Comprehensive volume load curves across microcycles, muscle group frequency distributions, and fatigue indicators. Prevent overreaching before plateaus occur." /></div></section>

      <section id="analytics" className="landing-section landing-compare-intro"><span className="landing-section-kicker">UNCOMPROMISING COMPARISON</span><h2>WHY SERIOUS LIFTERS CHOOSE<br /><em>GYMTRACK</em></h2><p>Fitness applications have turned into algorithmic social networks. Here is how we differ from the market standard.</p></section>
      <section id="compare" className="landing-compare-table"><div className="compare-head"><span>Progressive Overload Telemetry<br /><small>Volume, load, effort, rest — and your own evidence</small></span><span>Generic fitness apps</span><span className="orange-text">GymTrack core</span></div>{comparisonRows.map(([label, generic, core]) => <div className="compare-row" key={label}><strong>{label}</strong><span>{generic}</span><span>{core}</span></div>)}</section>

      <section id="pricing" className="landing-cta"><ShieldCheck size={19} /><h2>NO PRESCRIPTIONS. <em>JUST<br />YOUR RECORD.</em></h2><p>Join thousands of lifters documenting genuine athletic progression. Start your first session free—no credit card, no ads.</p><div className="landing-cta-form"><input placeholder="athlete@domain.com" aria-label="Email address" /><Link to="/signup" className="landing-button landing-button-orange">Get access <ArrowRight size={13} /></Link></div></section>
    </main>

    <footer className="landing-footer"><div className="landing-wordmark"><span className="landing-mark">G</span><span>GYMTRACK</span></div><p>High-performance telemetry and precision workout engineering for dedicated athletes.</p><div><span>PRODUCT</span><a href="#features">Features</a><a href="#preview">Live preview</a><a href="#analytics">Telemetry core</a></div><div><span>ECOSYSTEM</span><a href="#features">Athletes</a><a href="#compare">Terms of service</a><a href="#pricing">Privacy policy</a></div><div><span>CONTACT</span><a href="mailto:hello@gymtrack.app">hello@gymtrack.app</a></div><small>© 2025 GymTrack Engineering. Precision performance tracking.</small></footer>
  </div>;
}

function Feature({ icon: Icon, index, title, text }: { icon: typeof Dumbbell; index: string; title: string; text: string }) {
  const telemetry = index.startsWith('01') ? ['Input speed', '< 1.8 sec / set', 92] : index.startsWith('02') ? ['Previous benchmark', '107.5 kg × 5', 70] : ['Stimulus to fatigue', 'High (94.2%)', 85];
  return <article className="landing-feature-card"><div><div className="landing-feature-icon"><Icon size={16} /></div><span>{index}</span><h3>{title}</h3><p>{text}</p></div><div className="landing-feature-meta"><div><span>{telemetry[0]}</span><b>{telemetry[1]}</b></div><div className="landing-feature-line"><i style={{ width: `${telemetry[2]}%` }} /></div></div></article>;
}
