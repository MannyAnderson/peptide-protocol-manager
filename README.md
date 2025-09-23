Peptide App (Backend + React Native Frontend)
================================================

A beginner-friendly project that tracks peptides, schedules doses, logs daily vitals, and generates simple insights. The app consists of:

- Backend: FastAPI + Supabase (authentication and data)
- Frontend: React Native (Expo) + Supabase JS client

Quick Start
-----------

Prerequisites:
- Node.js 18+ and npm
- Python 3.11+
- Expo CLI (`npm i -g expo`)
- A Supabase project (free tier is fine)

1) Clone and configure environment variables

Create two `.env` files using the provided examples:

- Backend: create `backend/.env` (you can copy `backend/env.example` if present)
  - Required:
    - `SUPABASE_URL=<your-supabase-url>`
    - `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>` (server-side only; never expose to client)
    - Optional: `OPENAI_API_KEY=<key>` to enable AI insights

- Frontend (Expo): set public env vars in `app.config.js` or an `.env` file loaded by Expo
  - Required:
    - `EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>`
    - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`
    - `EXPO_PUBLIC_API_URL=http://localhost:8000` (backend URL)

2) Install dependencies

- Backend
  - `cd backend`
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`

- Frontend
  - `cd frontend`
  - `npm install`

3) Run the apps

- Backend (FastAPI)
  - `cd backend`
  - `uvicorn app.main:app --reload --port 8000`
  - Test: open `http://localhost:8000/health` in your browser

- Frontend (Expo)
  - `cd frontend`
  - `npm run start`
  - Press `i` or `a` to open iOS/Android simulators, or scan the QR with Expo Go

Supabase Setup (Tables)
-----------------------

Create these example tables to match the code (SQL shown for reference; you can use Supabase Table Editor):

```sql
-- User profiles (optional demo table used by /ping-db)
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text,
  created_at timestamp with time zone default now()
);

-- Inventory of peptides
create table if not exists peptides (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  units_remaining numeric,
  expires_on date,
  created_at timestamp with time zone default now()
);

-- Daily tracking entries
create table if not exists daily_tracking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  weight_lbs numeric,
  waist_in numeric,
  bp_am text,
  bp_pm text,
  body_fat_pct numeric,
  muscle_mass_pct numeric,
  resting_hr_bpm numeric,
  energy numeric,
  appetite numeric,
  performance numeric,
  peptide1_id uuid references peptides(id),
  peptide2_id uuid references peptides(id),
  peptide3_id uuid references peptides(id),
  notes text
);

-- AI insights history (optional)
create table if not exists insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  summary jsonb,
  tips jsonb
);
```

Beginner’s Guide (What’s Where)
--------------------------------

- Backend
  - `backend/app/main.py`: FastAPI app creation, CORS, health route, mounts `/api/v1`.
  - `backend/app/api/v1`: Versioned API routers. Notable routes:
    - `routes/health.py`: health checks
    - `routes/ping_db.py`: simple DB sanity check
    - `routes/export.py`: export tracking data to CSV
    - `routes/insights.py`: generate insights (uses OpenAI if configured)
  - `backend/app/api/dependencies/auth.py`: `require_user_id` dependency to validate JWT and return `user_id`.
  - `backend/app/utils/supabase.py`: creates a single Supabase client using SERVICE ROLE key.
  - `backend/app/core/config.py`: structured settings loaded from environment.

- Frontend (Expo)
  - `frontend/App.tsx`: app entry, navigation setup, notification scheduling.
  - `frontend/src/utils/supabase.ts`: Supabase JS client using anon key.
  - `frontend/src/api.ts`: minimal `apiGet`/`apiPost` helpers.
  - Screens under `frontend/screens/*`: Home, Login, Signup, Inventory, DailyTracking, Schedule, Vitals, Insights, Profile.
  - `frontend/src/utils/notifications.ts`: daily reminders (9 AM / 9 PM).
  - `frontend/src/utils/calendar.ts`: Expo Calendar helpers for dosage events.

Common Tasks
------------

- Update allowed origins (CORS) for local dev: edit `backend/app/main.py` `ALLOWED_ORIGINS`.
- Change API base URL used by the app: set `EXPO_PUBLIC_API_URL`.
- Check health endpoints:
  - `GET /health` (root)
  - `GET /api/v1/health`
  - `GET /api/v1/ping-db`

Troubleshooting
---------------

- 401 errors from protected endpoints: ensure you are signed in and your JWT is attached. The frontend uses `supabase.auth.getSession()` to grab a token.
- Supabase client not configured: verify backend `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Expo env not found: confirm vars are defined as `EXPO_PUBLIC_*` and restart the dev server.
- iOS/Android device cannot reach backend: use your machine’s LAN IP instead of `localhost` for `EXPO_PUBLIC_API_URL`.

License
-------

MIT


