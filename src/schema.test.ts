import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Schema & RLS Verification', () => {
  const sqlFilePath = path.resolve(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  it('verifies profiles table definition', () => {
    expect(sql).toContain('create table if not exists public.profiles');
    expect(sql).toContain('references auth.users on delete cascade');
  });

  it('verifies workout_logs table definition with user_id and day check', () => {
    expect(sql).toContain('create table if not exists public.workout_logs');
    expect(sql).toContain('user_id uuid references auth.users on delete cascade not null');
    expect(sql).toContain("check (workout_day in ('mon_thu', 'tue_fri', 'wed'))");
  });

  it('verifies workout_exercises table with foreign key and slots', () => {
    expect(sql).toContain('create table if not exists public.workout_exercises');
    expect(sql).toContain('workout_log_id uuid references public.workout_logs on delete cascade not null');
    expect(sql).toContain('weight_kg numeric(6, 2)');
    expect(sql).toContain('reps integer');
  });

  it('verifies Row Level Security is enabled on all tables', () => {
    expect(sql).toContain('alter table public.profiles enable row level security;');
    expect(sql).toContain('alter table public.workout_logs enable row level security;');
    expect(sql).toContain('alter table public.workout_exercises enable row level security;');
  });

  it('verifies user isolation policies with auth.uid() check', () => {
    expect(sql).toContain('create policy "Users can view own workout logs"');
    expect(sql).toContain('using (auth.uid() = user_id)');

    expect(sql).toContain('create policy "Users can view own workout exercises"');
    expect(sql).toContain('and public.workout_logs.user_id = auth.uid()');
  });

  it('verifies indexing for performance and cross-device lookups', () => {
    expect(sql).toContain('create index if not exists idx_workout_logs_user_day_date');
    expect(sql).toContain('create index if not exists idx_workout_exercises_log_id');
  });

  it('verifies auto-profile creation trigger upon auth signup', () => {
    expect(sql).toContain('create or replace function public.handle_new_user()');
    expect(sql).toContain('create trigger on_auth_user_created');
  });
});

