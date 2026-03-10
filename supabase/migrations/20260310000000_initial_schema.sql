-- ============================================================
-- TFit2 Initial Schema
-- Uses Supabase Auth (auth.users) for authentication
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  primary_goal text not null default 'general_health'
    check (primary_goal in ('fat_loss','muscle_gain','maintenance','endurance','general_health')),
  experience_level text not null default 'intermediate'
    check (experience_level in ('beginner','intermediate','advanced')),
  age int,
  weight_kg numeric(5,1),
  height_cm numeric(5,1),
  injuries jsonb not null default '[]'::jsonb,
  available_equipment text[] not null default '{}',
  available_days text[] not null default '{}',
  minutes_per_session int not null default 45,
  training_style text,
  dietary_preferences text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile"  on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Daily metrics
-- ---------------------------------------------------------------------------
create table public.daily_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  sleep_score int check (sleep_score between 0 and 100),
  sleep_hours numeric(3,1),
  hrv int,
  steps int,
  weight_kg numeric(5,1),
  body_battery int check (body_battery between 0 and 100),
  subjective_energy int check (subjective_energy between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

alter table public.daily_metrics enable row level security;
create policy "Users can manage own metrics" on daily_metrics for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Nutrition logs
-- ---------------------------------------------------------------------------
create table public.nutrition_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  logged_at timestamptz not null default now(),
  items text not null,
  calories numeric(7,1),
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  confidence numeric(3,2) not null default 0.5,
  source text not null default 'web',
  created_at timestamptz not null default now()
);

alter table public.nutrition_logs enable row level security;
create policy "Users can manage own nutrition" on nutrition_logs for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Workout logs
-- ---------------------------------------------------------------------------
create table public.workout_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  logged_at timestamptz not null default now(),
  workout_type text not null,
  exercises jsonb not null default '[]'::jsonb,
  rpe int check (rpe between 1 and 10),
  duration_minutes int,
  calories_burned int,
  source text not null default 'web',
  created_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;
create policy "Users can manage own workouts" on workout_logs for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Symptom logs
-- ---------------------------------------------------------------------------
create table public.symptom_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  logged_at timestamptz not null default now(),
  pain_location text not null,
  severity int not null check (severity between 0 and 10),
  notes text not null default '',
  source text not null default 'web',
  created_at timestamptz not null default now()
);

alter table public.symptom_logs enable row level security;
create policy "Users can manage own symptoms" on symptom_logs for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  plan_json jsonb not null,
  rationale text not null default '',
  confidence numeric(3,2) not null default 0.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

alter table public.plans enable row level security;
create policy "Users can manage own plans" on plans for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Conversation threads
-- ---------------------------------------------------------------------------
create table public.conversation_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  channel text not null default 'web',
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversation_threads enable row level security;
create policy "Users can manage own threads" on conversation_threads for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Coach messages
-- ---------------------------------------------------------------------------
create table public.coach_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid references public.conversation_threads on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.coach_messages enable row level security;
create policy "Users can manage own messages" on coach_messages for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Memory items (coach context persistence)
-- ---------------------------------------------------------------------------
create table public.memory_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  memory_type text not null,
  content text not null,
  importance int not null default 5,
  source text not null default 'coach',
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.memory_items enable row level security;
create policy "Users can manage own memories" on memory_items for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-update timestamps trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function handle_updated_at();
create trigger daily_metrics_updated_at before update on daily_metrics
  for each row execute function handle_updated_at();
create trigger plans_updated_at before update on plans
  for each row execute function handle_updated_at();
create trigger threads_updated_at before update on conversation_threads
  for each row execute function handle_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_daily_metrics_user_date on daily_metrics(user_id, date desc);
create index idx_nutrition_logs_user_date on nutrition_logs(user_id, logged_at desc);
create index idx_workout_logs_user_date on workout_logs(user_id, logged_at desc);
create index idx_symptom_logs_user_date on symptom_logs(user_id, logged_at desc);
create index idx_plans_user_date on plans(user_id, date desc);
create index idx_coach_messages_thread on coach_messages(thread_id, created_at);
create index idx_memory_items_user_active on memory_items(user_id) where is_active = true;
