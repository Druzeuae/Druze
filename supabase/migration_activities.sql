-- ============================================================================
-- MIGRATION: Activities feature (v2)
-- Run this in the Supabase SQL Editor for the existing project.
-- Adds a category to events (now used as "Activities") and lets any
-- authenticated user create/manage their own activity + RSVP.
-- ============================================================================

-- Activity category enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'activity_category') then
    create type public.activity_category as enum (
      'hiking', 'football', 'picnic', 'hangout', 'coffee', 'beach', 'game_night', 'volunteering', 'other'
    );
  end if;
end$$;

-- Add category column to events
alter table public.events
  add column if not exists category public.activity_category not null default 'other';

-- Allow any authenticated user to create their own activities
drop policy if exists "Admins manage events" on public.events;

create policy "Users create their own activities"
  on public.events for insert
  with check (created_by = auth.uid());

create policy "Users update their own activities"
  on public.events for update
  using (created_by = auth.uid());

create policy "Users delete their own activities"
  on public.events for delete
  using (created_by = auth.uid());

create policy "Admins manage all activities"
  on public.events for all
  using (public.is_admin());
