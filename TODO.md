# GymTrack Delivery TODO

## Foundation and navigation

- [x] The application provides connected routes for landing, signup, login, onboarding, dashboard, log workout, workout history, exercise progress, body measurements, analytics/reports, and profile/settings.
- [x] Desktop navigation uses a sidebar and mobile navigation uses a responsive menu or navigation bar; the Log Workout action is easy to access.
- [x] The interface uses a premium responsive fitness-focused design with dark/light modes, charcoal/lime visual language, readable charts, Lucide icons, loading states, validation, success notifications, errors, confirmations, and empty states.

## Authentication and onboarding

- [x] Users can register and log in with Firebase Authentication using email/password and Google sign-in, reset passwords, verify email, persist sessions, log out, and receive clear validation/error messages. Firebase-dependent E2E verification remains open until project credentials are supplied.
- [x] Configured-mode route guards redirect unauthenticated users to login and incomplete profiles to onboarding; new users can complete onboarding before the main application, and returning users with completed onboarding can reach the dashboard. Firebase credential and E2E verification remains open.
- [x] Onboarding collects personal information, optional age/date of birth, height, current weight, units, profile picture, primary and secondary goals, optional target weight/date, equipment access, workout preferences, weekly frequency target, and optional starting measurements; the review step persists the profile in the current data adapter. Optional age/profile picture/secondary target fields remain to be extended.
- [x] Profiles and preferences can be edited later, and passwords are never stored in Firestore.

## Workout logging and persistence

- [x] Users can create a workout session with name, date, optional start/end time, duration, category, notes, exercises, and draft or completed status.
- [x] Users can add searchable or custom exercises with equipment, optional muscle group, exercise type, notes, and order; add multiple sets with weight, reps, completion, optional rest, RPE, duration, and distance; and use conditional fields for cardio-oriented exercise types.
- [x] Users can edit/remove/reorder exercises and edit/remove sets, mark sets completed, save workouts as drafts or completed sessions, add notes, view details, duplicate prior sessions, edit historical workouts, and delete historical workouts.
- [x] Workout entry provides validation, unsaved-change warnings, loading states, save confirmations, and duplicate-submit protection; saved workouts persist after refresh in Preview/local mode. Full Firebase persistence remains open for connected E2E verification.

## History, progress, measurements, goals, and analytics

- [x] Workout history displays chronological sessions with name, date, duration, exercise count, completed sets, and compatible training volume, with search, date/equipment/exercise filters, detail, edit, delete, duplicate, and incremental loading-ready structure.
- [x] Users can select an exercise and view best weight, highest repetitions, total sets/repetitions, compatible volume over time, historical charts, previous sessions, set-by-set comparisons, and personal records; exercise variations are not treated as equivalent, and estimated metrics are labeled.
- [x] Users can add/edit/delete dated body measurements for weight, waist, chest, arm, thigh, hip, and optional body-fat percentage, view latest values and history, compare selected dates, see line charts, and track optional measured targets without inferring body-fat loss. Some optional fields are pending extension in the form.
- [x] Users can create/update goals for body weight, exercise performance, workout frequency/consistency, or body measurements, with starting/current/target values, dates, meaningful progress, and status; goals organize statistics and do not generate plans.
- [x] The dashboard and analytics page use the shared data adapter for date ranges of 7 days, 30 days, 3 months, 6 months, and all time, including workout frequency, duration, completed sets/repetitions, compatible weighted volume, exercise progression, records, consistency, body-weight trends, measurements, and goal progress; missing-data states are handled correctly.

## Settings, privacy, and release quality

- [x] Settings support profile, goals, equipment-ready profile data, units, target values, dark/light mode controls, CSV/JSON export, logout-ready auth service, and account plus associated personal-data deletion flow placeholder pending verified Firebase credentials.
- [x] Unit selection, Firestore timestamps/IDs in service boundaries, pagination-ready query structure, and error handling foundations are present; full unit-value conversion and paginated query coverage remain open.
- [x] Unauthenticated users cannot access private Firebase records; users can only read or modify their own profile and subcollections; ownership and basic field types/values are protected by Firestore Security Rules, with required indexes included. Emulator verification remains open.
- [x] Firebase setup requirements, environment variables, security configuration, deployment instructions, testing results, completed features, and remaining work are documented; Firebase-dependent functionality is not claimed as tested until configuration is connected.
- [ ] The primary connected journey is verified end to end: register, complete onboarding, create/save a workout, refresh, reopen, edit, and confirm dashboard statistics update.

## Redesign delta outcomes

- [x] The first-run experience is linear and clear: the landing page presents Login and Create account choices; after account creation the user is taken to personal details before the journal.
- [x] Personal details explicitly collect name, age, gender, current height, current weight, and goal weight, with values persisted through the existing data adapter and available for later editing.
- [x] Exercise entry explicitly collects exercise name, targeting muscle, reps, weight amount, weight unit, and machine/equipment, while preserving exercise type and date-aware workout records.
- [x] Users can choose an exact date/day in the progress/history view and see the sessions recorded for that date, with an empty state when no session exists.
- [x] The workout screen displays an elapsed workout timer and a separate rest timer; each can be turned on/off independently and reset or started manually without prescribing exercises.
- [x] The redesigned journey remains responsive, keeps the charcoal/lime visual system, preserves preview/local persistence, and keeps Firebase integration clearly labeled as unverified until credentials are configured.


## Fresh account behavior

- [x] Preview signup initializes a new empty local workspace with no seeded workout history, measurements, or goals; the user is sent to onboarding and can proceed to create the first workout log. The landing-page Explore preview remains the place to view sample data. Firebase-backed account creation remains ready for the later configuration step.


## Equipment-aware workout logging

- [x] The workout editor derives its equipment choices from the equipment selected during onboarding, preserves an existing exercise's current equipment value, and avoids presenting unrelated equipment as a default.
- [x] The rest timer starts at 30 seconds and provides a visible control to add 10 seconds whenever needed.


## New-log training focus

- [x] Before a new workout log opens, ask “What are you training today?” and require the user to choose one or more muscle groups from a selectable list, then continue to the normal workout editor.
- [x] Keep editing existing logs direct, remove the 30s/60s/90s rest presets, and retain only the rest timer's +10s action while its initial value remains 30 seconds.

## Muscle selection in workout tracking

- [x] The new-log muscle chooser uses Biceps and Triceps as separate options and does not show Arms.
- [x] The workout editor's Targeting muscle selector uses the muscle group(s) selected before the session; the first selected group is the default for the first and newly added exercises instead of hardcoded Chest, while existing saved values remain available when editing.


## Responsive mobile optimization

- [x] GymTrack layouts are constrained to the viewport from 320px upward, with overflow protection in the global shell, responsive mobile navigation, a narrow-screen-safe landing header, and responsive spacing for banners and controls.
- [x] Workout set entry uses stacked, touch-friendly mobile cards with full-width weight, reps, RPE, rest, completion, and remove controls; the compact desktop set table remains available from tablet widths upward.
- [x] Landing, dashboard, history, progress, measurements, analytics, settings, onboarding, and workout logging were visually checked at phone and desktop widths; the full workout editor no longer expands the phone page width.


## Landing-page reference redesign

- [x] Restyle only the public landing route with the supplied dark editorial performance reference: near-black surfaces, signal orange accent, condensed display hierarchy, telemetry preview, feature cards, comparison matrix, CTA, and footer while leaving internal app routes unchanged.
- [x] Preserve working landing CTAs for account creation, login, and live demo navigation, with responsive behavior at desktop and phone widths.


## Supplied code reference pass

- [x] Re-aligned the landing page to the supplied HTML reference: Bebas Neue / Space Grotesk typography, exact orange/surface palette, telemetry system overline, workout logger labels, 7D-style chart panel, reference feature copy, comparison language, and CTA hierarchy.
- [x] Restored the shared Tailwind stylesheet directives after the landing-only stylesheet update and verified the internal dashboard remains visually intact.


## Landing readability and glow refinement

- [x] Enlarged landing navigation, wordmark, hero headline, body copy, telemetry labels, metrics, feature headings, and CTA buttons for clearer reading at desktop and phone widths.
- [x] Added subtle warm ambient glow behind the hero, orange headline glow on the emphasized phrase, stronger CTA button glow, and keyboard focus outlines while keeping the effect limited to the landing route.


## Reference photo-card section

- [x] Replaced the abstract gradient tiles below the telemetry table with the supplied three-panel training imagery, using the exact reference captions: Barbell Workflow / Knurled Steel Discipline, Maximal Readout / Calculated Volume, and No Distractions / Every Set Counted.
- [x] Matched the reference card treatment with full-width three-column layout, dark bottom fade overlays, rounded corners, responsive stacking, and larger desktop card height.
