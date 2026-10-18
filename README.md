# GymTrack

GymTrack is a responsive React + TypeScript workout log and progress analytics application. It tracks sessions the user performs, measurements the user records, and goals the user defines. It does not generate workout plans, prescribe exercises, recommend routines, or act as a personal trainer.

## Local development

Install dependencies with `pnpm install`, copy `.env.example` to `.env.local`, then add the browser configuration from a Firebase Web App. Start the Preview server with `pnpm dev` and open the managed Preview URL. `pnpm typecheck` and `pnpm build` are the main local checks.

## Firebase setup

Create a Firebase project, enable Authentication providers for Email/Password and Google, and enable Cloud Firestore. Register a Web App and copy its browser configuration into these Vite variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.

Deploy the included `firestore.rules` and `firestore.indexes.json` with the Firebase CLI. The application stores profiles at `users/{uid}`, workouts at `users/{uid}/workouts/{workoutId}`, nested exercises and sets, measurements at `users/{uid}/bodyMeasurements/{measurementId}`, and goals at `users/{uid}/goals/{goalId}`. The rules scope reads and writes to the authenticated owner. Never commit `.env.local` or other credential files.

With no Firebase values, the UI intentionally runs in a clearly labeled Preview mode using local browser persistence so the interface and manual logging flow can be reviewed without confusing sample data for real progress. Firebase auth and Firestore modules are present and are used automatically when configuration is available; they still require a real Firebase project to be tested end to end.

## Release

Run `pnpm build`, deploy the `dist` directory to Firebase Hosting, and keep the SPA rewrite in `firebase.json`. Before production, verify email verification, password reset, Google sign-in, Firestore rules in the Firebase Emulator Suite, account deletion, unit conversion behavior, and the journey of registering, onboarding, creating a workout, refreshing, reopening, editing, and confirming dashboard updates.
