# TFit2 — Development Guidelines

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Architecture

- **Unified Next.js 14 app** — no separate backend
- **API routes** in `src/app/api/` replace the old FastAPI backend
- **Supabase** for auth (Google OAuth), database (PostgreSQL), and storage
- **Pure-function engines** in `src/lib/engines/` — no side effects, no DB calls
- **RLS** (Row Level Security) on all tables — queries are user-scoped automatically

## Conventions

- TypeScript strict mode — type everything
- Functional React components with hooks
- Tailwind CSS for styling (no CSS modules)
- Commits: imperative mood ("Add feature", not "Added feature")
- API routes return `NextResponse.json()` with proper status codes
- All database access via Supabase client (server-side: `createServerSupabase()`)
- Engine functions are pure — test them without DB

## File Structure

- `src/app/api/***/route.ts` — API route handlers
- `src/app/[page]/page.tsx` — Page components
- `src/components/` — Reusable React components
- `src/lib/engines/` — Business logic (readiness, targets, training, coach)
- `src/lib/supabase/` — Supabase client setup (client, server, middleware)
- `src/types/` — TypeScript types and database schema
- `supabase/migrations/` — SQL migrations

## Security

- All tables have RLS enabled
- Auth middleware protects routes in `src/middleware.ts`
- Server-side Supabase client uses cookies for auth
- Service role key only used for admin operations
- No hardcoded secrets
