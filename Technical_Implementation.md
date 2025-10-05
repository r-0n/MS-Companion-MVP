# MS Companion – Codebase & Technical Implementation

## Monorepo Structure

```
MS-Companion-MVP/
│
├── server/         # Node.js Express backend (TypeScript, Drizzle ORM, ML integration)
├── client/         # React 18 web frontend (Vite, TypeScript, PWA)
├── mobile/         # React Native mobile app (TypeScript, Expo)
├── flutter/        # Flutter/Dart mobile app (alternative mobile client)
├── shared/         # Shared TypeScript types and schema (if present)
├── .env            # Root environment variables (never commit this)
└── README.md
```

---

## 1. Backend – `server/`

- **Framework:** Express.js (TypeScript, ESM)
- **Database:** PostgreSQL (Neon or local), accessed via [Drizzle ORM](https://orm.drizzle.team/) and [postgres-js](https://github.com/porsager/postgres)
- **Schema:** Defined in `@shared/schema` (users, healthMetrics, riskAssessments, chatMessages)
- **ML Integration:** Python ML service (Random Forest, scikit-learn) called via Node.js child process for risk prediction
- **Environment:** Loads secrets from `.env` using `dotenv`
- **API:** RESTful endpoints under `/api` (e.g., `/api/predict-risk`, `/api/latest-risk/:userId`)
- **Validation:** Uses [Zod](https://zod.dev/) schemas for request validation

**Key Files:**
- `index.ts` – Express app entry point, API routes, middleware
- `storage.ts` – Database access layer (implements `IStorage` interface)
- `ml-service.py` – Python script for risk prediction (invoked by backend)
- `.env` – Must include `DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`

**Notable Patterns:**
- All database access is abstracted via the `DatabaseStorage` class.
- ML predictions are performed by spawning a Python process and communicating via stdin/stdout.
- User authentication is handled via Firebase UID, passed from the frontend.

---

## 2. Web Frontend – `client/`

- **Framework:** React 18 + TypeScript, built with [Vite](https://vitejs.dev/)
- **Routing:** [Wouter](https://github.com/molefrog/wouter) (lightweight React router)
- **State/Data:** [TanStack Query](https://tanstack.com/query/latest) for server state, React Context for auth
- **UI:** [Radix UI](https://www.radix-ui.com/) primitives + [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **PWA:** Service worker (`public/sw.js`), manifest, install prompt, offline support
- **Auth:** Firebase Authentication (email/password), managed via Context and hooks
- **API:** Communicates with backend via REST endpoints

**Key Files/Folders:**
- `src/pages/` – Route components (dashboard, chat, history, auth, not-found)
- `src/components/` – UI and feature components (health-metrics-input, risk-status-card, trend-chart, etc.)
- `src/hooks/` – Custom React hooks (e.g., `use-auth`, `use-toast`)
- `src/lib/` – Utility modules (Firebase, query client, service worker registration)
- `public/manifest.json` – PWA metadata
- `.env` – Must include `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`

**Notable Patterns:**
- Uses optimistic updates and cache invalidation with TanStack Query.
- Implements a custom install prompt for PWA.
- All sensitive logic (e.g., database, ML) is handled server-side; frontend only calls APIs.

---

## 3. React Native Mobile App – `mobile/`

- **Framework:** React Native (TypeScript, Expo)
- **Navigation:** React Navigation (Bottom Tab Navigator)
- **Auth:** Firebase Authentication (email/password)
- **API:** Calls backend Express API for health metrics, risk prediction, chat, etc.
- **UI:** Custom components, styled for mobile
- **Env:** Uses `.env.example` for environment variable documentation

**Key Files/Folders:**
- `App.tsx` – App entry point, navigation setup
- `navigation/BottomTabNavigator.tsx` – Tab navigation for main screens
- `screens/` – Main screens (Dashboard, Input, Trends, Settings, Auth)
- `lib/api.ts` – API client for backend communication
- `lib/firebase.ts` – Firebase initialization

**Notable Patterns:**
- Mirrors web app features: dashboard, health input, trends, chat, settings.
- Uses Firebase UID for user identification in API calls.

---

## 4. Flutter Mobile App – `flutter/`

- **Framework:** Flutter (Dart)
- **Auth:** Firebase Authentication (email/password)
- **API:** Communicates with backend Express API
- **UI:** Material Design 3, blue theme, bottom navigation
- **Env:** `.env.example` for documentation, `firebase_options.dart` for Firebase config

**Key Files/Folders:**
- `lib/main.dart` – App entry point
- `lib/screens/` – Main screens (dashboard, input, trends, settings, auth, home)
- `lib/services/` – API and auth service classes
- `firebase_options.dart` – Generated Firebase config

**Notable Patterns:**
- Feature parity with React Native/web app.
- Uses Provider for state management.

---

## 5. Shared Types & Schema – `shared/` (if present)

- **Purpose:** Central location for TypeScript types and Drizzle ORM schema
- **Usage:** Imported by both backend and frontend for type safety

---

## 6. Environment Variables

- **Backend (`server/.env` or root `.env`):**
  - `DATABASE_URL` – PostgreSQL connection string
  - `GEMINI_API_KEY` – Google Gemini API key
  - `SESSION_SECRET` – Express session secret

- **Frontend (`client/.env`):**
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`

- **Mobile (`mobile/.env.example`, `flutter/.env.example`):**
  - Firebase and API endpoint configs

---

## 7. Data Flow & Integration

- **User Auth:**  
  - All clients (web, React Native, Flutter) use Firebase Authentication.
  - On login/signup, Firebase UID is used as the user identifier for all backend API calls.

- **Health Metrics & Risk Prediction:**  
  - Clients send health metrics to backend via `/api/predict-risk`.
  - Backend stores metrics, calls Python ML service for risk prediction, stores/returns risk assessment.

- **Chat (Gemini AI):**  
  - Clients send chat messages to `/api/chat`.
  - Backend uses Gemini API, stores conversation in PostgreSQL.

- **Trends & History:**  
  - Clients fetch historical data via `/api/risk-history/:userId` and similar endpoints.

---

## 8. Development & Build

- **Backend:**  
  - `npm run dev` (hot reload with tsx)
  - Uses dotenv for env vars

- **Web Frontend:**  
  - `cd client && npm run dev` (Vite dev server)

- **React Native:**  
  - `cd mobile && npm start` (Expo)

- **Flutter:**  
  - `cd flutter && flutter run`

---

## 9. Security & Best Practices

- **Secrets:**  
  - Never commit `.env` files or secrets to version control.
  - Only backend has access to sensitive keys (DB, Gemini).

- **Validation:**  
  - All API inputs validated with Zod (backend).

- **Data Integrity:**  
  - Foreign key constraints enforced in PostgreSQL.
  - User must exist before inserting health metrics.

---

## 10. Extending the Codebase

- **Add new API endpoints:**  
  - Define route in `server/routes.ts`, implement logic in `server/storage.ts`.

- **Add new frontend features:**  
  - Create new components/pages in `client/src/components` or `client/src/pages`.

- **Add new mobile screens:**  
  - Add to `mobile/screens/` (React Native) or `flutter/lib/screens/`.

- **Update database schema:**  
  - Edit shared schema, run Drizzle migrations.

---

## 11. Troubleshooting

- **400/500 errors:**  
  - Check backend logs for validation or DB errors.
  - Ensure user exists before posting health metrics.

- **Env issues:**  
  - Double-check `.env` files and variable names.

- **Database:**  
  - Ensure PostgreSQL is running and accessible.

---

## 12. References

- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Vite Docs](https://vitejs.dev/guide/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Flutter Docs](https://docs.flutter.dev/)

---

*For further details, see inline comments in each folder’s README or code files.*