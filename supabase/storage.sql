-- ============================================================================
-- DRUZE UAE — Storage Buckets & Policies
-- Run after schema.sql
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('profile-photos', 'profile-photos', true, 8388608, array['image/png','image/jpeg','image/webp']),
  ('intro-videos', 'intro-videos', true, 52428800, array['video/mp4','video/quicktime']),
  ('chat-media', 'chat-media', false, 10485760, array['image/png','image/jpeg','image/webp','audio/mpeg','audio/webm','audio/mp4'])
on conflict (id) do nothing;

-- Avatars / profile photos: users can manage their own folder (named by user id)
create policy "Users can upload their own profile photos"
  on storage.objects for insert
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own profile photos"
  on storage.objects for update
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own profile photos"
  on storage.objects for delete
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Anyone can view profile photos"
  on storage.objects for select
  using (bucket_id in ('profile-photos', 'avatars', 'intro-videos'));

create policy "Users can upload their own intro videos"
  on storage.objects for insert
  with check (bucket_id = 'intro-videos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Chat media: only conversation participants can read; sender can write
create policy "Users can upload chat media to their own folder"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view chat media they sent or received"
  on storage.objects for select
  using (
    bucket_id = 'chat-media'
    and auth.uid() is not null
  );
