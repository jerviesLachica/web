# Sunsaver Web MVP

Firebase-backed powerbank rental management for a school prototype. This web app replaces the original Android-only flow with a responsive React application that supports:

- email/password auth with verification
- user and admin dashboards
- inventory CRUD
- QR/NFC/manual rental and return flows
- Firestore-backed rental transactions
- Realtime Database telemetry for ESP32 status
- installable PWA behavior

## Stack

- React 18 + TypeScript + Vite 7
- Tailwind CSS v4 + shadcn/ui
- Firebase Auth, Firestore, Realtime Database, Hosting
- Zustand for session state
- React Hook Form + Zod
- Recharts
- Vitest + Playwright

## Setup

1. Copy `.env.example` to `.env`
2. Fill in the Firebase web configuration values
3. Install dependencies
4. Start the app

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run test:e2e
npm run emulators
```

## Firebase Files

- `firebase.json`
- `firestore.rules`
- `database.rules.json`
- [`docs/operator-guide.md`](./docs/operator-guide.md)

## MVP Notes

- Spark-only architecture: no Cloud Functions
- Rentals are free to use
- Overdue state is derived in the app from `dueAt`
- Push notifications and background sync are deferred
