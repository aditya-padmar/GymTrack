import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGymData } from '../context/GymDataContext';
import { formatDate } from '../utils/calculations';

export function Measurements() {
  const { data, addMeasurement, deleteMeasurement } = useGymData();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [dateInput, setDateInput] = useState('Today, 07:15 AM (Fasted)');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [chartTab, setChartTab] = useState<'mass' | 'waist' | 'overlay'>('mass');

  const sorted = [...data.measurements].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  const entriesDesc = [...sorted].reverse();

  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const delta =
    latest?.weight && previous?.weight ? latest.weight - previous.weight : 0;

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const weightVal = parseFloat(weight);
    if (isNaN(weightVal)) return;

    addMeasurement({
      recordedAt: new Date().toISOString(),
      weight: weightVal,
      waist: parseFloat(waist) || undefined,
      bodyFatPercentage: parseFloat(bodyFat) || undefined,
      unitSystem: data.profile.preferredUnits,
    });

    setWeight('');
    setWaist('');
    setBodyFat('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden bg-surface-container-lowest pb-space-xxl">
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary-container/10 blur-[130px]"></div>
        <div className="pointer-events-none absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-surface-tint/5 blur-[100px]"></div>

        {/* Notification Bar */}
        <div className="mb-space-lg flex items-center justify-between rounded-lg bg-surface-container-low px-space-md py-space-sm text-on-surface shadow-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              bolt
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">
              <strong className="font-semibold text-on-surface">
                Preview telemetry active.
              </strong>{' '}
              Connect Firebase backend to synchronize biometric markers across all athletic nodes.
            </span>
          </div>
          <Link
            className="flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider text-primary hover:text-on-surface transition-colors"
            to="/settings"
          >
            <span>Setup Telemetry Node</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* View Header Section */}
        <div className="mb-space-xl flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1 font-label-sm text-label-sm uppercase tracking-widest text-primary-container font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-ping"></span>
                MEASURED, NOT INFERRED
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                / PROTOCOL v2.4
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-wider uppercase m-0 leading-none">
              BODY MEASUREMENTS
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              Keep your physical markers in one synchronized timeline. Body-fat values and
              composition ratios are only cataloged upon active physical verification.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 rounded-lg bg-surface-container px-space-md py-2.5 font-label-lg text-label-lg text-on-surface hover:bg-surface-container-high transition-colors"
              id="toggle-filter-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">tune</span>
              <span>CALIBRATE UNITS</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-2 rounded-lg bg-primary-container px-space-lg py-2.5 font-label-lg text-label-lg font-bold text-on-primary-container shadow-[0_0_24px_rgba(255,94,30,0.35)] hover:shadow-[0_0_32px_rgba(255,94,30,0.6)] transition-all"
              id="open-measurement-modal"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90 duration-300">
                add
              </span>
              <span>ADD MEASUREMENT</span>
            </button>
          </div>
        </div>

        {/* Quick Telemetry Row (Top Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-xl">
          {/* Latest Weight */}
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low/90 backdrop-blur-xl p-space-md shadow-md transition-all hover:bg-surface-container/90">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
                LATEST WEIGHT
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                <span className="material-symbols-outlined text-[18px]">scale</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-metric-stat text-metric-stat tracking-tight text-on-surface"
                id="stat-weight-val"
              >
                {latest?.weight ? latest.weight.toFixed(1) : '--'}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase tracking-wider">
                KG
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant pt-space-xs">
              <span className="font-label-sm text-label-sm">
                {latest ? formatDate(latest.recordedAt) : 'No entry recorded yet'}
              </span>
              <span className="font-label-sm text-label-sm text-primary">
                {latest ? 'VERIFIED' : 'AWAITING INPUT'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary-container transition-all duration-300 group-hover:w-full"></div>
          </div>

          {/* Latest Waist */}
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low/90 backdrop-blur-xl p-space-md shadow-md transition-all hover:bg-surface-container/90">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
                LATEST WAIST
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                <span className="material-symbols-outlined text-[18px]">straighten</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-metric-stat text-metric-stat tracking-tight text-on-surface"
                id="stat-waist-val"
              >
                {latest?.waist ? latest.waist.toFixed(1) : '--'}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase tracking-wider">
                CM
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant pt-space-xs">
              <span className="font-label-sm text-label-sm">
                {latest?.waist ? formatDate(latest.recordedAt) : 'No entry recorded yet'}
              </span>
              <span className="font-label-sm text-label-sm text-primary">
                {latest?.waist ? 'VERIFIED' : 'AWAITING INPUT'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary-container transition-all duration-300 group-hover:w-full"></div>
          </div>

          {/* Delta Since Prior */}
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low/90 backdrop-blur-xl p-space-md shadow-md transition-all hover:bg-surface-container/90">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">
                CHANGE SINCE PRIOR
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-tertiary">
                <span className="material-symbols-outlined text-[18px]">swap_vert</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className={`font-metric-stat text-metric-stat tracking-tight ${
                  delta < 0 ? 'text-primary-container' : 'text-secondary'
                }`}
                id="stat-delta-val"
              >
                {delta ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '0.0'}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant uppercase tracking-wider">
                KG DELTA
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant pt-space-xs">
              <span className="font-label-sm text-label-sm">Measured mass variance</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                {sorted.length > 1 ? 'DELTA COMPUTED' : 'BASELINE STATIC'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary-container transition-all duration-300 group-hover:w-full"></div>
          </div>
        </div>

        {/* Main Dynamic Panels (Bento Architecture) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Panel: Graphic Coordinate Grid / Biometric Trend (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-xl bg-surface-container-low/90 backdrop-blur-xl p-space-lg shadow-md relative min-h-[460px]">
            <div className="flex items-start justify-between mb-space-lg">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container font-bold">
                  TREND LINE
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-wide uppercase mt-0.5">
                  WEIGHT AND WAIST OVER TIME
                </h2>
              </div>
              <div className="flex items-center gap-space-xs bg-surface-container p-1 rounded-lg">
                <button
                  onClick={() => setChartTab('mass')}
                  className={`rounded px-2.5 py-1 font-label-sm text-label-sm font-semibold transition-colors ${
                    chartTab === 'mass'
                      ? 'bg-surface-container-high text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  MASS (KG)
                </button>
                <button
                  onClick={() => setChartTab('waist')}
                  className={`rounded px-2.5 py-1 font-label-sm text-label-sm font-semibold transition-colors ${
                    chartTab === 'waist'
                      ? 'bg-surface-container-high text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  WAIST (CM)
                </button>
                <button
                  onClick={() => setChartTab('overlay')}
                  className={`rounded px-2.5 py-1 font-label-sm text-label-sm font-semibold transition-colors ${
                    chartTab === 'overlay'
                      ? 'bg-surface-container-high text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  OVERLAY
                </button>
              </div>
            </div>

            {/* Trend Graph Container */}
            <div className="relative flex-1 flex flex-col justify-center items-center rounded-lg bg-surface-container-lowest/60 p-space-md overflow-hidden min-h-[320px]">
              {/* Coordinate Grid SVG Graphic */}
              <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    height="48"
                    id="grid-pattern"
                    patternUnits="userSpaceOnUse"
                    width="48"
                  >
                    <path
                      className="text-secondary"
                      d="M 48 0 L 0 0 0 48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.75"
                    ></path>
                  </pattern>
                </defs>
                <rect fill="url(#grid-pattern)" height="100%" width="100%"></rect>
              </svg>

              {/* SVG Graphic Axes Overlay */}
              <svg
                className="absolute inset-0 h-full w-full pointer-events-none p-space-md"
                fill="none"
                id="trend-line-chart"
                viewBox="0 0 600 280"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  className="text-surface-variant"
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                  x1="40"
                  x2="560"
                  y1="240"
                  y2="240"
                ></line>
                <line
                  className="text-surface-variant"
                  opacity="0.4"
                  stroke="currentColor"
                  strokeDasharray="2 4"
                  strokeWidth="1"
                  x1="40"
                  x2="560"
                  y1="160"
                  y2="160"
                ></line>
                <line
                  className="text-surface-variant"
                  opacity="0.4"
                  stroke="currentColor"
                  strokeDasharray="2 4"
                  strokeWidth="1"
                  x1="40"
                  x2="560"
                  y1="80"
                  y2="80"
                ></line>
                <g
                  className={`transition-all duration-700 ${
                    sorted.length >= 2 ? 'opacity-100' : 'opacity-0'
                  }`}
                  id="dynamic-trend-path"
                >
                  <path
                    d="M60 220 C180 200, 280 140, 400 120 C480 105, 520 80, 550 70"
                    fill="none"
                    stroke="#FF5E1E"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                  <path
                    d="M60 220 C180 200, 280 140, 400 120 C480 105, 520 80, 550 70 L550 240 L60 240 Z"
                    fill="url(#trend-gradient)"
                    opacity="0.25"
                  ></path>
                  <circle className="animate-pulse" cx="550" cy="70" fill="#FF5E1E" r="5"></circle>
                </g>
                <defs>
                  <linearGradient id="trend-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF5E1E" stopOpacity="0.8"></stop>
                    <stop offset="100%" stopColor="#FF5E1E" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
              </svg>

              {/* Empty State Telemetry Callout */}
              {sorted.length < 2 && (
                <div
                  className="relative z-10 flex flex-col items-center text-center max-w-sm px-space-md"
                  id="chart-empty-state"
                >
                  <div className="mb-space-sm flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary-container shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">show_chart</span>
                  </div>
                  <span className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider mb-1">
                    Add at least two measurements to see a trend
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Telemetry requires multiple reference timestamps to plot biometric progression
                    vectors and trajectory paths.
                  </p>
                  <div className="mt-space-md flex items-center gap-space-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                    <span className="font-label-sm text-label-sm">
                      Standard deviation threshold: ±0.2 kg
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Footer Timeline Marker */}
            <div className="mt-space-md flex items-center justify-between text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-container"></span>
                <span className="font-label-sm text-label-sm text-on-surface">
                  CALIBRATION RANGE: LAST 90 DAYS
                </span>
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest">
                SAMPLING RESOLUTION: DAILY (00:00 UTC)
              </span>
            </div>
          </div>

          {/* Right Panel: Measurement Log (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col rounded-xl bg-surface-container-low/90 backdrop-blur-xl p-space-lg shadow-md min-h-[460px]">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container font-bold">
                  MEASUREMENT LOG
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-wide uppercase mt-0.5">
                  RECORDED ENTRIES
                </h2>
              </div>
              <div className="flex items-center gap-1 rounded bg-surface-container px-2.5 py-1">
                <span
                  className="font-label-sm text-label-sm font-bold text-on-surface"
                  id="log-count"
                >
                  {entriesDesc.length}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  TOTAL
                </span>
              </div>
            </div>

            {/* Entries Container */}
            <div className="flex-1 flex flex-col justify-center">
              {entriesDesc.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-lg bg-surface-container-lowest/60 p-space-xl text-center"
                  id="log-empty-state"
                >
                  <div className="relative mb-space-md flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-primary-container shadow-[0_0_12px_rgba(255,94,30,0.8)]"></div>
                    <div className="absolute -inset-1.5 rounded-full border border-primary-container/20 animate-ping"></div>
                  </div>
                  <h3 className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider mb-1">
                    No measurements yet
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                    Record a weight or circumference marker when you choose to establish physical
                    benchmarks.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-space-lg flex items-center gap-2 rounded bg-surface-container hover:bg-surface-container-high px-space-md py-2 font-label-sm text-label-sm uppercase font-semibold text-primary transition-all"
                    id="cta-quick-entry"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                    <span>Input First Marker</span>
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col gap-space-xs overflow-y-auto max-h-[340px] pr-1"
                  id="log-records-list"
                >
                  {entriesDesc.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                    >
                      <div className="flex items-center gap-space-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-primary-container font-mono font-bold text-label-sm">
                          #{entriesDesc.length - index}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-headline-md text-[20px] text-on-surface tracking-wider leading-none">
                              {item.weight ? `${item.weight.toFixed(1)} KG` : '—'}
                            </span>
                            {item.waist && (
                              <span className="font-label-sm text-label-sm text-tertiary">
                                | {item.waist.toFixed(1)} CM
                              </span>
                            )}
                            {item.bodyFatPercentage && (
                              <span className="rounded bg-surface-container-highest px-1.5 py-0.5 text-label-sm font-semibold text-primary">
                                {item.bodyFatPercentage}% BF
                              </span>
                            )}
                          </div>
                          <span className="font-body-md text-label-sm text-on-surface-variant truncate max-w-[180px]">
                            Standard check-in
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                            {formatDate(item.recordedAt)}
                          </span>
                          <span className="font-label-sm text-[10px] text-tertiary uppercase">
                            VERIFIED
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteMeasurement(item.id)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-surface-container-low transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Protocol Notes / Quick Sync Footer */}
            <div className="mt-space-md pt-space-md bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span className="font-label-sm text-label-sm">
                  END-TO-END ATHLETIC ENCRYPTION
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-mono">
                HASH: 8F2A90C1
              </span>
            </div>
          </div>
        </div>

        {/* Quick Reference Biometric Guide & Anthropometry Banner */}
        <div className="mt-space-xl grid grid-cols-1 md:grid-cols-12 gap-gutter items-center rounded-xl bg-surface-container p-space-lg">
          <div className="md:col-span-8 flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              ATHLETIC STANDARDS
            </span>
            <h3 className="font-headline-md text-headline-md uppercase text-on-surface tracking-wider">
              ACCURACY PROTOCOL FOR WEIGHT &amp; GIRTH GAUGING
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Execute body weigh-ins upon waking, post-void, prior to hydration or nutrient intake.
              For waist measurements, align the tape horizontally level with the iliac crest and
              umbilicus in an unforced, relaxed respiratory state.
            </p>
          </div>
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-space-md">
            <div className="flex flex-col text-right">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                STANDARD FREQUENCY
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">3x / WEEK</span>
            </div>
            <div className="h-10 w-0.5 bg-surface-container-highest"></div>
            <div className="flex flex-col text-right">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                TIME COMPLIANCE
              </span>
              <span className="font-headline-md text-headline-md text-primary-container">
                MORNING FASTED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Floating Entry Overlay */}
      <div
        onClick={() => setShowModal(false)}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md transition-all duration-300 ${
          showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        id="measurement-modal"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-lg rounded-xl bg-surface-container p-space-xl shadow-2xl mx-gutter transform transition-transform duration-300 ${
            showModal ? 'scale-100' : 'scale-95'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-space-md right-space-md h-8 w-8 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            id="close-measurement-modal"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-space-xs mb-1">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              add_box
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              TELEMETRY ENTRY
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-wider mb-space-md">
            LOG BODY MARKERS
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-space-md" id="measurement-form">
            {/* Date / Time */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                RECORD DATE &amp; TIME
              </label>
              <div className="flex items-center rounded-lg bg-surface-container-low px-space-md py-2.5">
                <span className="material-symbols-outlined text-[18px] text-tertiary mr-2">
                  calendar_today
                </span>
                <input
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                  id="input-date"
                  type="text"
                />
              </div>
            </div>

            {/* Row: Weight & Waist */}
            <div className="grid grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                  WEIGHT (KG)
                </label>
                <div className="flex items-center rounded-lg bg-surface-container-low px-space-md py-2.5">
                  <span className="material-symbols-outlined text-[18px] text-tertiary mr-2">
                    scale
                  </span>
                  <input
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                    id="input-weight"
                    placeholder="e.g. 78.4"
                    required
                    step="0.1"
                    type="number"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                  WAIST (CM)
                </label>
                <div className="flex items-center rounded-lg bg-surface-container-low px-space-md py-2.5">
                  <span className="material-symbols-outlined text-[18px] text-tertiary mr-2">
                    straighten
                  </span>
                  <input
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                    id="input-waist"
                    placeholder="e.g. 81.0"
                    step="0.5"
                    type="number"
                  />
                </div>
              </div>
            </div>

            {/* Optional Body Fat */}
            <div className="flex flex-col gap-1">
              <label className="flex items-center justify-between font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                <span>BODY FAT % (OPTIONAL)</span>
                <span className="text-tertiary">CALIPER OR DEXA</span>
              </label>
              <div className="flex items-center rounded-lg bg-surface-container-low px-space-md py-2.5">
                <span className="material-symbols-outlined text-[18px] text-tertiary mr-2">
                  percent
                </span>
                <input
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                  id="input-bf"
                  placeholder="e.g. 13.8"
                  step="0.1"
                  type="number"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                SESSION CONTEXT
              </label>
              <div className="flex items-center rounded-lg bg-surface-container-low px-space-md py-2.5">
                <span className="material-symbols-outlined text-[18px] text-tertiary mr-2">
                  notes
                </span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                  id="input-notes"
                  placeholder="e.g. Post rest-day, carb depletion phase"
                  type="text"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="mt-space-sm flex items-center justify-end gap-space-sm">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-surface-container-high px-space-md py-2.5 font-label-lg text-label-lg font-bold text-on-surface hover:bg-surface-bright transition-colors"
                id="cancel-modal"
                type="button"
              >
                CANCEL
              </button>
              <button
                className="flex items-center gap-2 rounded-lg bg-primary-container px-space-lg py-2.5 font-label-lg text-label-lg font-bold text-on-primary-container shadow-[0_0_20px_rgba(255,94,30,0.35)] hover:shadow-[0_0_28px_rgba(255,94,30,0.55)] transition-all"
                type="submit"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>COMMIT RECORD</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
