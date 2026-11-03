# GymTrack Implementation Plan

## Scope and approach

GymTrack will be a responsive React + TypeScript single-page application with client-side Firebase Authentication and Cloud Firestore. It will record workouts users perform and present historical statistics; it will not generate workout plans, prescribe exercises, recommend routines, or act as a trainer.

The first implementation will deliver the complete connected product shell and the highest-priority working flows: landing/authentication, onboarding, profile persistence, workout creation/editing/duplication/deletion, workout history, exercise progress, body measurements, goals, dashboard analytics, settings, export, and responsive navigation. Firebase configuration will be environment-driven and clearly surfaced when absent; the application will not claim Firebase functionality is tested until it is connected.

The UI will use Tailwind CSS, Lucide React icons, Recharts, and Firebase SDK modules. Firestore will use the requested per-user document hierarchy, with timestamps and ownership-scoped reads/writes. Firestore rules and indexes will be included in the repository. Calculations will live outside UI components so weighted volume, personal records, date filtering, goal progress, and unit conversion stay consistent.

## Project structure

- `src/app/` — router, providers, route guards, app-level state.
- `src/components/layout/` — desktop sidebar, mobile navigation, page shell, header.
- `src/components/ui/` — reusable cards, buttons, inputs, dialogs, empty/loading/error states, charts.
- `src/components/workouts/` — workout editor, exercise rows, set editor, detail views.
- `src/components/dashboard/` — metric cards, recent sessions, trend summaries, record panels.
- `src/components/analytics/` — reusable chart panels and date-range controls.
- `src/pages/` — landing, auth, onboarding, dashboard, workout, history, progress, measurements, analytics, settings.
- `src/services/` — Firebase initialization plus auth, profile, workout, measurement, goal, export, and analytics services.
- `src/hooks/` — auth/profile/data hooks and form persistence helpers.
- `src/types/` — Firestore and UI TypeScript interfaces.
- `src/utils/` — dates, units, calculations, validation, CSV/JSON serialization.
- `public/manus-routes.json` — complete route manifest for the managed preview.
- `firestore.rules` and `firestore.indexes.json` — private ownership rules and query indexes.
- `.env.example` — required Firebase browser configuration names without secret values.
- `TODO.md` — outcome-based implementation status and the PRD acceptance clauses.

## Functional design

Authentication routes will support email/password registration and login, Google sign-in, password reset, email verification state, persistent sessions, logout, validation, and clear Firebase error mapping. Protected routes will redirect unauthenticated users to login and incomplete profiles to onboarding.

Onboarding will be a four-step form: personal information and units, goals, equipment, and preferences/starting measurements, followed by a review and Firestore save. The profile and settings screens will reuse the same schemas and correctly convert stored values when the unit system changes.

The workout editor will be deliberately manual. Users add searchable or custom exercises, choose exercise type/equipment, add sets, mark completion, edit/reorder/remove exercises and sets, save drafts or completed sessions, add notes, duplicate prior workouts, and reopen historical sessions. Cardio-oriented fields will be shown conditionally. Duplicate-submit protection, validation, unsaved-change warnings, loading indicators, save feedback, and destructive-action confirmations will be included.

The dashboard, history, progress, measurements, goals, and analytics screens will use Firestore data and shared selectors. Date ranges will include 7 days, 30 days, 3 months, 6 months, and all time. Weighted volume will only be calculated for compatible weighted sets as `weight × repetitions`; exercise variants remain distinct. Any estimated one-repetition maximum will be explicitly labeled as an estimate. Body-fat values will only display measured entries or clearly labeled calculations and will never be inferred from body-weight changes.

## Design direction

Three possible styles were considered:

1. **Performance Console** — high-contrast dark fitness dashboard with lime instrumentation accents. Probability 0.07.
2. **Quiet Progress Journal** — light, editorial tracking workspace with soft neutrals and restrained chart color. Probability 0.06.
3. **Night Training Club** — charcoal, lime, and electric-blue athletic interface with bold data panels. Probability 0.05.

### Selected: Performance Console

- **Design movement:** premium performance-console UI, combining a strength-training logbook with an instrument panel rather than a generic SaaS grid.
- **Core principles:** dense but calm information hierarchy; every metric has context; manual control over recommendations; strong contrast and touch-friendly controls.
- **Color philosophy:** near-black charcoal gives the logbook a focused training-room atmosphere; a single lime accent signals completed effort and progression; muted slate neutrals keep secondary data quiet; red/amber are reserved for warnings and destructive states.
- **Layout paradigm:** a persistent desktop rail and a flexible content canvas with asymmetric hero summaries, wide chart bands, and stacked activity panels; on mobile, the rail becomes a bottom/slide-over control surface while the log form remains a single-column flow.
- **Signature elements:** a lime vertical progress trace, compact uppercase metric labels, and a distinctive “session ledger” treatment for workout history.
- **Interaction philosophy:** every action should feel reversible and explicit; confirmations are reserved for destructive actions, while saves provide immediate local feedback and Firestore status.
- **Animation:** 150–220ms fades and slides for panels, subtle count-up only for newly loaded summaries, no bouncing or ornamental motion, and reduced-motion support.
- **Typography system:** Inter or system sans for body/UI, with a heavier display weight for section titles; numeric metrics use tabular figures for clean comparison.
- **Brand essence:** a private training record that turns performed sessions into readable evidence of progress; precise, grounded, motivating.
- **Brand voice:** direct and factual, e.g. “Log what you did.” and “See the work add up.”
- **Wordmark/logo:** a compact “G” mark formed from two offset lime ledger strokes, paired with a custom-spaced GymTrack wordmark.
- **Signature brand color:** acid lime `#C8F53A` on charcoal `#101310`.

## Build workflow

1. Create the Vite/React/TypeScript foundation and install pinned dependencies.
2. Add the route manifest, theme tokens, app shell, auth/onboarding route guards, and reusable UI states.
3. Add Firebase initialization and service modules with typed Firestore models; include explicit missing-configuration handling.
4. Build the workout editor and persistence flow first, then history/detail/duplicate/edit/delete.
5. Add measurements, goals, exercise progress, calculations, exports, and analytics/dashboard selectors.
6. Add Firestore rules/indexes, environment documentation, accessibility polish, responsive behavior, and settings/account deletion flow.
7. Run diagnostics, typecheck/build, inspect route manifest, start Preview, and exercise the connected primary journey once Firebase credentials are configured. Any unverified Firebase-dependent step will remain explicitly marked as blocked rather than being claimed complete.
8. Commit and checkpoint the implementation to the managed project repository; publish only if publication is requested or already authorized.

## Explicit non-goals

- No workout-plan generation, routine recommendations, exercise prescriptions, nutrition plans, or personal-trainer behavior.
- No administrator dashboard.
- No future enhancements such as offline sync, wearables, progress-photo storage, or notifications until the core release is stable.

## Approval note

This plan assumes Firebase remains the requested external data/authentication provider, uses no unnecessary custom backend, and ships a real data model plus a clearly documented configuration handoff. Implementation should begin after review of this plan.

## Redesign delta: simpler first-run journey and session tools

The primary first-run journey is now intentionally linear: landing page, then login or create account, then a focused personal-details form collecting name, age, gender, current height, current weight, and goal weight before the user reaches the journal. Existing goal/equipment preferences may remain available as secondary settings rather than blocking the first workout.

Workout entry will make the user's requested exercise record explicit: exercise name, targeting muscle, reps, weight amount, weight unit, and machine/equipment. The user can reopen the application, choose an exact workout date/day, and inspect the sessions and progress recorded for that day. The workout editor will expose an elapsed workout timer and a separately controlled rest timer, both with visible on/off controls and reset/start actions. Neither timer generates training advice.


## Equipment and timer refinement

Workout entry will derive the equipment selector from the user's onboarding `equipmentAccess` values, include the current saved equipment value for historical records when necessary, and use the first onboarding choice only as the default for a newly added exercise. The rest timer's initial/reset duration is 30 seconds, with an explicit +10 seconds action.


## New-log focus gate

A new workout log opens with a short “What are you training today?” gate. It supports multi-selecting muscle groups before continuing to the existing workout editor; editing an existing log skips the gate. The rest timer retains a 30-second initial value and exposes only the +10 seconds action.


## Selected-muscle propagation correction

The new-log focus selections are passed into the workout editor as the available Targeting muscle options. The first selected group initializes the first exercise and newly added exercises; users can switch each exercise among the selected groups. Biceps and Triceps are separate focus options, and the generic Arms option is removed. Existing saved exercise muscle values remain visible when editing.


## Responsive layout refinement

GymTrack uses viewport-safe shell containers and responsive spacing across the app. On phones, the landing header prioritizes the primary account action, the mobile drawer fits narrow screens, and the workout editor switches from the desktop set table to stacked touch-friendly set cards. Tablet and desktop widths retain the denser table and two-column workout layout.


## Landing-page reference treatment

The public landing page now uses a dense, dark performance-editorial treatment based on the supplied reference: signal orange instead of the app's internal lime accent, condensed uppercase headline hierarchy, compact telemetry dashboard preview, abstract training image tiles, evidence-led feature cards, a comparison matrix, bold CTA panel, and compact footer. Internal routes retain the existing GymTrack UI.


## Exact reference alignment

The supplied HTML reference is the source of truth for the landing pass: its copy, orange primary-container color, dark surface hierarchy, Bebas Neue display family, Space Grotesk body family, header labels, telemetry control labels, feature metadata, comparison vocabulary, and CTA structure are reflected in the React landing route. Shared app styles remain separate and unchanged in behavior.


## Readability and glow refinement

The landing route now uses a larger display scale and stronger readable labels across the header, hero, telemetry preview, feature cards, and CTA controls. Reference-style glow is intentionally restrained: a broad warm ambient bloom, a soft orange text halo on the emphasized hero phrase, orange CTA shadowing, and visible keyboard focus outlines.


## Reference photo-card section

The landing telemetry section now flows into a three-panel image strip using the supplied reference visuals. Each card uses the reference's full-bleed photo treatment, dark bottom gradient, orange eyebrow label, condensed caption, rounded corners, and responsive single-column fallback on mobile.


## Full-screen landing composition

The desktop landing route now follows the supplied 1920px reference as a viewport composition rather than only a component style: the header and telemetry frame use a 1540px reading width, hero spacing is intentionally tall, the headline breaks before PROGRESS, the copy wraps to the reference rhythm, and the CTA/proof row sits above a lower telemetry panel. Mobile overrides remain separate.


## Interactive telemetry table redesign

The landing preview now uses a reference-style telemetry cockpit rather than a static table. State is local to the landing demo: exercise tabs, time-range pills, and set completion rows respond to user input. Interaction feedback uses the orange signal color for active and completed states, subtle glow on hover, focus-visible outlines, and quiet charcoal surfaces for the inactive states.


## High-resolution landing card imagery

The photo-card section uses restored high-resolution source assets instead of stretching the original 340px crops. The restoration preserves the supplied gym scenes and lets the existing CSS crop and dark caption overlay operate over substantially sharper source imagery at desktop card width.


## Variable daily volume chart

The landing telemetry chart keeps daily values in a distinct seven-point series and now removes the flex growth that was flattening all bars to equal height. Each bar uses its inline daily percentage, with the highlighted training day retaining the orange glow.


## Lower-page readability and contrast refinement

The lower landing sections now use a stepped type scale rather than tiny editorial microcopy: supporting paragraphs, feature descriptions, comparison rows, metadata, footer copy, and the contact CTA are all larger and brighter. General surfaces are lifted from near-black to charcoal for separation, while the contact CTA remains the darkest section with light-orange text as the visual close.


## Footer contrast and typography refinement

The footer now closes the page with a darker full-width band, creating a clear separation from the lighter charcoal landing surfaces above. Its supporting copy, navigation, contact address, and legal line use a larger light-orange scale, with a brighter hover state for links and responsive reductions only on narrow screens.


## CTA reference redesign

The final call-to-action will become a contained editorial panel: rounded charcoal surface, centered dumbbell marker, large condensed two-line headline with white and orange emphasis, readable centered copy, wide dark email field paired with an orange access button, and a restrained orange glow concentrated toward the lower-right edge.


## Comparison-section reference redesign

The comparison block will use a more editorial matrix: a centered orange kicker and condensed heading, followed by a rounded charcoal panel. Each capability row carries a small explanatory subtitle, generic fitness apps remain visually muted, and GymTrack Core is emphasized with a light-orange accent and lightning marker.


## Engineered Clarity reference redesign

The feature section will adopt the uploaded editorial layout: the section label and large two-line condensed headline occupy the left side, explanatory copy sits in a balanced right column, and three taller charcoal cards use orange icon tiles, readable supporting copy, and telemetry footer bars with clear metric hierarchy.


## Dense landing-section spacing refinement

The three largest lower-page blocks will be visually tightened without removing content: the telemetry cockpit, comparison matrix, and CTA panel will use narrower shared max-widths, smaller internal padding and row heights, and explicit centered margins to maintain equal whitespace on both sides.
