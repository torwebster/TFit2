# TFit2 — AI Fitness OS

Privacy-first, adaptive AI fitness coaching platform. Personalized training plans, smart nutrition coaching, and intelligent recovery — all powered by AI that adapts to you every single day.

## Architecture

**Unified Next.js 14 app** deployed on **Vercel** with **Supabase** for auth, database, and storage.

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/               # Route Handlers (replaces FastAPI backend)
│   │   ├── auth/          # Supabase Auth callback
│   │   ├── profile/       # User profile CRUD
│   │   ├── plan/          # Plan generation & retrieval
│   │   ├── logs/          # Metrics, nutrition, workout, symptom logging
│   │   ├── coach/         # AI coach messaging
│   │   └── dashboard/     # Dashboard aggregation
│   ├── today/             # Today's plan view
│   ├── dashboard/         # Weekly overview
│   ├── log/               # Detailed logging
│   ├── onboarding/        # Setup wizard
│   └── settings/          # Profile settings
├── components/            # React components
├── lib/
│   ├── engines/           # Pure-function fitness logic (TS port)
│   │   ├── engine.ts      # Main orchestrator
│   │   ├── readiness.ts   # Readiness score (0-100)
│   │   ├── targets.ts     # Calorie/macro/step targets
│   │   ├── training.ts    # Workout plan generation
│   │   └── coach.ts       # Intent classification & response
│   └── supabase/          # Supabase client (browser, server, middleware)
├── types/                 # TypeScript types
└── middleware.ts           # Auth guard
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL 15) |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project (free tier works)

### Setup

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials in .env.local
# Apply migration: supabase/migrations/20260310000000_initial_schema.sql
npm run dev
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Add Supabase integration (auto-populates env vars)
3. Deploy

## Adaptive Engine

Pure-function pipeline with no side effects:

```
EngineContext (profile + metrics + history)
  → computeReadiness()  → 0-100 score, level
  → computeTargets()    → steps, calories, macros
  → computeTraining()   → workout type, exercises, RPE
  → buildDailyPlan()    → complete daily prescription
```

## Key Features

- **Google OAuth** via Supabase Auth
- **Adaptive daily plans** based on 13+ health signals
- **AI coach chat** with intent classification and auto-logging
- **Smart onboarding** (< 3 minutes, 5-step wizard)
- **Comprehensive logging** (metrics, meals, workouts, symptoms)
- **Explainable AI** — every recommendation includes reasoning
- **Privacy-first** — RLS on all tables, user-scoped data
- **Mobile-responsive** — works great on phone and desktop
