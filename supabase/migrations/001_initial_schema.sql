-- ==============================================================================
-- 001_initial_schema.sql
-- Supabase Schema for Minimalist Workout Logger
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Keeps user profile reference tied to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. WORKOUT LOGS TABLE
-- Records each workout session with day type and date
create table if not exists public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  workout_day text not null check (workout_day in ('mon_thu', 'tue_fri', 'wed')),
  workout_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. WORKOUT EXERCISES TABLE
-- Stores individual exercise entries (slots) within a workout log
create table if not exists public.workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid references public.workout_logs on delete cascade not null,
  muscle_group text not null,
  slot_number integer not null,
  exercise_name text not null,
  weight_kg numeric(6, 2),
  reps integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PERFORMANCE INDEXES
create index if not exists idx_workout_logs_user_day_date on public.workout_logs (user_id, workout_day, workout_date desc);
create index if not exists idx_workout_exercises_log_id on public.workout_exercises (workout_log_id);
create index if not exists idx_workout_exercises_lookup on public.workout_exercises (exercise_name, updated_at desc);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_exercises enable row level security;

-- 6. ROW LEVEL SECURITY POLICIES

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Workout logs policies
create policy "Users can view own workout logs"
  on public.workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own workout logs"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workout logs"
  on public.workout_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own workout logs"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

-- Workout exercises policies (isolated by workout_logs ownership)
create policy "Users can view own workout exercises"
  on public.workout_exercises for select
  using (
    exists (
      select 1 from public.workout_logs
      where public.workout_logs.id = public.workout_exercises.workout_log_id
        and public.workout_logs.user_id = auth.uid()
    )
  );

create policy "Users can insert own workout exercises"
  on public.workout_exercises for insert
  with check (
    exists (
      select 1 from public.workout_logs
      where public.workout_logs.id = public.workout_exercises.workout_log_id
        and public.workout_logs.user_id = auth.uid()
    )
  );

create policy "Users can update own workout exercises"
  on public.workout_exercises for update
  using (
    exists (
      select 1 from public.workout_logs
      where public.workout_logs.id = public.workout_exercises.workout_log_id
        and public.workout_logs.user_id = auth.uid()
    )
  );

create policy "Users can delete own workout exercises"
  on public.workout_exercises for delete
  using (
    exists (
      select 1 from public.workout_logs
      where public.workout_logs.id = public.workout_exercises.workout_log_id
        and public.workout_logs.user_id = auth.uid()
    )
  );

-- 7. TRIGGER FOR AUTO-CREATING USER PROFILE UPON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

