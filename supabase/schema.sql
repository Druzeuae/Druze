-- ============================================================================
-- DRUZE UAE — Database Schema
-- PostgreSQL / Supabase
-- ============================================================================
-- Notes:
--  * auth.users is managed by Supabase Auth. `profiles.id` references it.
--  * All tables have Row Level Security (RLS) enabled with sensible policies.
--  * Run this file in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
create type gender_type as enum ('male', 'female', 'other');
create type nationality_type as enum ('druze', 'friend_ally');
create type city_type as enum ('dubai', 'abu_dhabi', 'sharjah', 'other');
create type observance_type as enum ('practicing', 'moderately_practicing', 'cultural', 'prefer_not_to_say');
create type lifestyle_type as enum ('family_oriented', 'career_oriented', 'balanced', 'adventurous');
create type visibility_type as enum ('public', 'community_only', 'hidden');
create type connection_intent as enum ('marriage', 'friendship', 'professional');
create type appreciation_status as enum ('pending', 'matched');
create type match_status as enum ('active', 'unmatched');
create type message_type as enum ('text', 'photo', 'voice', 'system');
create type conversation_status as enum ('matched', 'request', 'blocked');
create type report_category as enum ('fake_profile', 'harassment', 'spam', 'inappropriate_content', 'other');
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type notification_type as enum (
  'new_match', 'new_message', 'appreciation', 'profile_view',
  'connection_request', 'system', 'event_reminder'
);
create type account_status as enum ('active', 'suspended', 'banned', 'deleted');
create type verification_level as enum ('none', 'phone', 'photo', 'premium');

-- ----------------------------------------------------------------------------
-- PROFILES
-- Extends auth.users (1:1). id == auth.users.id
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- Basic info
  full_name text not null,
  display_name text not null,
  gender gender_type,
  date_of_birth date,
  nationality nationality_type,
  city city_type,
  languages text[] default '{}',
  occupation text,

  -- Media
  photos text[] default '{}',           -- storage paths, first = face photo
  intro_video_url text,

  -- Bio sections
  about_me text check (char_length(about_me) <= 500),
  personal_values text,
  lifestyle_text text,
  hobbies_text text,

  -- Alignment fields
  religious_observance observance_type default 'prefer_not_to_say',
  lifestyle lifestyle_type,

  -- Connection intent (multi-select)
  intents connection_intent[] default '{}',

  -- Verification
  phone_verified boolean default false,
  photo_verified boolean default false,
  premium_verified boolean default false,
  verification_level verification_level default 'none',

  -- Trust score (0-100), recalculated by trigger/function
  trust_score smallint default 0 check (trust_score between 0 and 100),

  -- Privacy & status
  visibility visibility_type default 'public',
  account_status account_status default 'active',
  is_premium boolean default false,
  premium_until timestamptz,

  -- Onboarding
  onboarding_step smallint default 1,
  onboarding_completed boolean default false,

  -- Consent / compliance
  pdpl_consent boolean default false,
  pdpl_consent_at timestamptz,
  age_confirmed boolean default false,

  -- Activity
  last_active_at timestamptz default now(),
  community_events_attended smallint default 0,

  -- Admin
  is_admin boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint adult_only check (
    date_of_birth is null or date_of_birth <= (current_date - interval '18 years')
  )
);

comment on table public.profiles is 'Extended user profile data, 1:1 with auth.users';

-- ----------------------------------------------------------------------------
-- INTERESTS (catalog)
-- ----------------------------------------------------------------------------
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  category text not null,            -- e.g. 'Sports', 'Creative', 'Druze Heritage'
  name text not null,
  name_ar text,
  sort_order smallint default 0,
  unique (category, name)
);

-- ----------------------------------------------------------------------------
-- USER_INTERESTS (junction)
-- ----------------------------------------------------------------------------
create table public.user_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, interest_id)
);

-- ----------------------------------------------------------------------------
-- APPRECIATIONS (one-directional "like" / star)
-- ----------------------------------------------------------------------------
create table public.appreciations (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  status appreciation_status default 'pending',
  message text,                       -- optional intro / connection request message
  created_at timestamptz default now(),
  unique (from_user_id, to_user_id),
  constraint no_self_appreciation check (from_user_id <> to_user_id)
);

create index idx_appreciations_to_user on public.appreciations (to_user_id);
create index idx_appreciations_from_user on public.appreciations (from_user_id);

-- ----------------------------------------------------------------------------
-- MATCHES (mutual appreciation)
-- ----------------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  compatibility_score smallint default 0 check (compatibility_score between 0 and 100),
  status match_status default 'active',
  matched_at timestamptz default now(),
  unmatched_at timestamptz,
  unmatched_by uuid references public.profiles (id),
  constraint match_user_order check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create index idx_matches_user_a on public.matches (user_a_id);
create index idx_matches_user_b on public.matches (user_b_id);

-- ----------------------------------------------------------------------------
-- CONVERSATIONS
-- ----------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid references public.matches (id) on delete set null,
  status conversation_status default 'matched',
  last_message_at timestamptz default now(),
  last_message_preview text,
  created_at timestamptz default now(),
  constraint conversation_user_order check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create index idx_conversations_last_message on public.conversations (last_message_at desc);

-- ----------------------------------------------------------------------------
-- MESSAGES
-- ----------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  type message_type default 'text',
  content text,                       -- text body or caption
  media_url text,                     -- photo / voice note storage path
  media_duration_seconds smallint,    -- for voice notes
  reaction jsonb default '{}'::jsonb, -- { user_id: emoji }
  read_at timestamptz,
  delivered_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_messages_conversation on public.messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- BLOCKS
-- ----------------------------------------------------------------------------
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

-- ----------------------------------------------------------------------------
-- REPORTS
-- ----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  category report_category not null,
  details text,
  status report_status default 'open',
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  admin_notes text,
  created_at timestamptz default now()
);

create index idx_reports_status on public.reports (status);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  title_ar text,
  body text,
  body_ar text,
  related_user_id uuid references public.profiles (id),
  related_entity_id uuid,             -- match_id / conversation_id / event_id
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user on public.notifications (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- EVENTS (Phase 2 placeholder)
-- ----------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  city city_type,
  location text,
  cover_image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer,
  created_by uuid references public.profiles (id),
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- EVENT_PARTICIPANTS (Phase 2 placeholder)
-- ----------------------------------------------------------------------------
create table public.event_participants (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create profile row automatically when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.raw_user_meta_data->>'full_name', 'New User'), ' ', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Calculate trust score based on verification, completeness, activity
create or replace function public.calculate_trust_score(profile_id uuid)
returns smallint as $$
declare
  p record;
  score smallint := 0;
  completeness_fields smallint := 0;
  total_fields smallint := 8;
begin
  select * into p from public.profiles where id = profile_id;
  if p is null then return 0; end if;

  -- Verification (up to 40 pts)
  if p.phone_verified then score := score + 15; end if;
  if p.photo_verified then score := score + 15; end if;
  if p.premium_verified then score := score + 10; end if;

  -- Profile completeness (up to 30 pts)
  if p.about_me is not null and length(p.about_me) > 0 then completeness_fields := completeness_fields + 1; end if;
  if p.personal_values is not null then completeness_fields := completeness_fields + 1; end if;
  if p.lifestyle_text is not null then completeness_fields := completeness_fields + 1; end if;
  if p.hobbies_text is not null then completeness_fields := completeness_fields + 1; end if;
  if array_length(p.photos, 1) >= 3 then completeness_fields := completeness_fields + 1; end if;
  if array_length(p.photos, 1) >= 6 then completeness_fields := completeness_fields + 1; end if;
  if p.occupation is not null then completeness_fields := completeness_fields + 1; end if;
  if array_length(p.intents, 1) > 0 then completeness_fields := completeness_fields + 1; end if;
  score := score + round((completeness_fields::numeric / total_fields) * 30)::smallint;

  -- Community attendance (up to 15 pts)
  score := score + least(p.community_events_attended * 3, 15);

  -- Account age (up to 15 pts) — 1 pt per 30 days, capped
  score := score + least(extract(day from now() - p.created_at)::smallint / 30, 15);

  return least(score, 100);
end;
$$ language plpgsql;

-- Recalculate trust score on relevant profile updates
create or replace function public.update_trust_score()
returns trigger as $$
begin
  new.trust_score := public.calculate_trust_score(new.id);
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_trust_score
  before insert or update on public.profiles
  for each row execute function public.update_trust_score();

-- When a mutual appreciation occurs, create a match + conversation + notifications
create or replace function public.handle_appreciation_insert()
returns trigger as $$
declare
  reciprocal record;
  uid_a uuid;
  uid_b uuid;
  shared_interests smallint;
  shared_intents smallint;
  total_intents smallint;
  compat smallint;
  new_match_id uuid;
begin
  -- Check for reciprocal appreciation
  select * into reciprocal
  from public.appreciations
  where from_user_id = new.to_user_id and to_user_id = new.from_user_id;

  if reciprocal is not null then
    uid_a := least(new.from_user_id, new.to_user_id);
    uid_b := greatest(new.from_user_id, new.to_user_id);

    -- Compute shared interests
    select count(*) into shared_interests
    from public.user_interests ui1
    join public.user_interests ui2 on ui1.interest_id = ui2.interest_id
    where ui1.user_id = uid_a and ui2.user_id = uid_b;

    -- Compute intent overlap
    select count(*) into shared_intents
    from (
      select unnest(intents) as intent from public.profiles where id = uid_a
      intersect
      select unnest(intents) as intent from public.profiles where id = uid_b
    ) t;

    select greatest(array_length(intents, 1), 1) into total_intents from public.profiles where id = uid_a;

    compat := least(100, (shared_interests * 8) + (shared_intents * 20));
    if compat = 0 then compat := 35; end if;

    -- Mark both appreciations as matched
    update public.appreciations set status = 'matched'
      where (from_user_id = new.from_user_id and to_user_id = new.to_user_id)
         or (from_user_id = new.to_user_id and to_user_id = new.from_user_id);

    -- Create match (idempotent)
    insert into public.matches (user_a_id, user_b_id, compatibility_score)
    values (uid_a, uid_b, compat)
    on conflict (user_a_id, user_b_id) do update set status = 'active'
    returning id into new_match_id;

    -- Create conversation (idempotent)
    insert into public.conversations (user_a_id, user_b_id, match_id, status)
    values (uid_a, uid_b, new_match_id, 'matched')
    on conflict (user_a_id, user_b_id) do update set status = 'matched', match_id = new_match_id;

    -- Notifications for both users
    insert into public.notifications (user_id, type, title, title_ar, body, body_ar, related_user_id, related_entity_id)
    values
      (new.from_user_id, 'new_match', 'New Match!', 'تطابق جديد!', 'You have a new match.', 'لديك تطابق جديد.', new.to_user_id, new_match_id),
      (new.to_user_id, 'new_match', 'New Match!', 'تطابق جديد!', 'You have a new match.', 'لديك تطابق جديد.', new.from_user_id, new_match_id);
  else
    -- Notify the recipient of the appreciation
    insert into public.notifications (user_id, type, title, title_ar, body, body_ar, related_user_id)
    values (new.to_user_id, 'appreciation', 'Someone appreciated your profile', 'أحدهم أعجب بملفك الشخصي', new.message, new.message, new.from_user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_appreciation_insert
  after insert on public.appreciations
  for each row execute function public.handle_appreciation_insert();

-- Update conversation preview on new message + notify recipient
create or replace function public.handle_new_message()
returns trigger as $$
declare
  conv record;
  recipient_id uuid;
begin
  select * into conv from public.conversations where id = new.conversation_id;
  recipient_id := case when conv.user_a_id = new.sender_id then conv.user_b_id else conv.user_a_id end;

  update public.conversations
    set last_message_at = new.created_at,
        last_message_preview = case
          when new.type = 'text' then left(new.content, 120)
          when new.type = 'photo' then '📷 Photo'
          when new.type = 'voice' then '🎤 Voice note'
          else new.content
        end
    where id = new.conversation_id;

  insert into public.notifications (user_id, type, title, title_ar, body, body_ar, related_user_id, related_entity_id)
  values (recipient_id, 'new_message', 'New message', 'رسالة جديدة',
          case when new.type = 'text' then left(new.content, 120) else 'Sent you media' end,
          case when new.type = 'text' then left(new.content, 120) else 'أرسل لك ملف وسائط' end,
          new.sender_id, new.conversation_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_new_message
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.appreciations enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$ language sql stable security definer;

-- PROFILES policies
create policy "Profiles are viewable based on visibility"
  on public.profiles for select
  using (
    visibility = 'public'
    or id = auth.uid()
    or public.is_admin()
    or (visibility = 'community_only' and auth.uid() is not null)
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- INTERESTS (public catalog, read-only for users)
create policy "Anyone can view interests"
  on public.interests for select
  using (true);

-- USER_INTERESTS
create policy "Users can view interests of visible profiles"
  on public.user_interests for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = user_interests.user_id and p.visibility <> 'hidden')
  );

create policy "Users manage their own interests"
  on public.user_interests for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- APPRECIATIONS
create policy "Users view appreciations involving them"
  on public.appreciations for select
  using (from_user_id = auth.uid() or to_user_id = auth.uid() or public.is_admin());

create policy "Users create their own appreciations"
  on public.appreciations for insert
  with check (from_user_id = auth.uid());

create policy "Users delete their own appreciations"
  on public.appreciations for delete
  using (from_user_id = auth.uid());

-- MATCHES
create policy "Users view their own matches"
  on public.matches for select
  using (user_a_id = auth.uid() or user_b_id = auth.uid() or public.is_admin());

create policy "Users update their own matches (unmatch)"
  on public.matches for update
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

-- CONVERSATIONS
create policy "Users view their own conversations"
  on public.conversations for select
  using (user_a_id = auth.uid() or user_b_id = auth.uid() or public.is_admin());

create policy "Users update their own conversations"
  on public.conversations for update
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

create policy "Users create conversations they are part of"
  on public.conversations for insert
  with check (user_a_id = auth.uid() or user_b_id = auth.uid());

-- MESSAGES
create policy "Users view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    ) or public.is_admin()
  );

create policy "Users send messages in their conversations"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "Users update messages (read receipts / reactions) in their conversations"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- BLOCKS
create policy "Users view their own blocks"
  on public.blocks for select
  using (blocker_id = auth.uid() or public.is_admin());

create policy "Users manage their own blocks"
  on public.blocks for all
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- REPORTS
create policy "Users view their own submitted reports"
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

create policy "Users create reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

create policy "Admins update reports"
  on public.reports for update
  using (public.is_admin());

-- NOTIFICATIONS
create policy "Users view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users update their own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- EVENTS (read-only public placeholder)
create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Admins manage events"
  on public.events for all
  using (public.is_admin());

-- EVENT_PARTICIPANTS
create policy "Users view event participants"
  on public.event_participants for select
  using (true);

create policy "Users manage their own event participation"
  on public.event_participants for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- SEED DATA: Interests catalog
-- ============================================================================
insert into public.interests (category, name, name_ar, sort_order) values
  ('Sports', 'Football', 'كرة القدم', 1),
  ('Sports', 'Gym', 'النادي الرياضي', 2),
  ('Sports', 'Running', 'الركض', 3),
  ('Sports', 'Cycling', 'ركوب الدراجات', 4),
  ('Sports', 'Swimming', 'السباحة', 5),
  ('Creative', 'Photography', 'التصوير', 1),
  ('Creative', 'Art', 'الفن', 2),
  ('Creative', 'Music', 'الموسيقى', 3),
  ('Creative', 'Design', 'التصميم', 4),
  ('Intellectual', 'Reading', 'القراءة', 1),
  ('Intellectual', 'Business', 'الأعمال', 2),
  ('Intellectual', 'Technology', 'التكنولوجيا', 3),
  ('Intellectual', 'History', 'التاريخ', 4),
  ('Social', 'Coffee Meetups', 'لقاءات القهوة', 1),
  ('Social', 'Board Games', 'ألعاب الطاولة', 2),
  ('Social', 'Volunteering', 'التطوع', 3),
  ('Outdoor', 'Hiking', 'المشي لمسافات طويلة', 1),
  ('Outdoor', 'Desert Trips', 'رحلات الصحراء', 2),
  ('Outdoor', 'Camping', 'التخييم', 3),
  ('Outdoor', 'Beach', 'الشاطئ', 4),
  ('Cultural', 'Language Exchange', 'تبادل اللغات', 1),
  ('Cultural', 'Book Club', 'نادي الكتاب', 2),
  ('Cultural', 'Cooking', 'الطبخ', 3),
  ('Druze Heritage', 'Cultural Events', 'فعاليات ثقافية', 1),
  ('Druze Heritage', 'Community Gatherings', 'تجمعات المجتمع', 2),
  ('Druze Heritage', 'Traditions', 'التقاليد', 3)
on conflict (category, name) do nothing;

-- ============================================================================
-- REALTIME
-- ============================================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.matches;
