
-- Eternity Tech Consulting - Secure Knowledge Hub
-- Run in Supabase > SQL Editor

create extension if not exists pgcrypto;

-- 1. Tables
create table if not exists public.knowledge_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(trim(author)) between 1 and 60),
  title text not null check (char_length(trim(title)) between 1 and 150),
  content_html text not null check (char_length(content_html) between 1 and 50000),
  image_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author text not null check (char_length(trim(author)) between 1 and 60),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- For an existing comments table
alter table public.comments
add column if not exists approved boolean not null default false;

create index if not exists posts_created_at_idx
on public.posts (created_at desc);

create index if not exists comments_post_created_idx
on public.comments (post_id, created_at asc);

-- 2. Enable RLS
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.knowledge_admins enable row level security;

-- 3. Remove old policies from this setup
drop policy if exists "Anyone can read posts" on public.posts;
drop policy if exists "Anyone can publish posts" on public.posts;
drop policy if exists "Admins can delete posts" on public.posts;
drop policy if exists "Admins can publish posts" on public.posts;
drop policy if exists "Admins can update posts" on public.posts;

drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Anyone can add comments" on public.comments;
drop policy if exists "Admins can delete comments" on public.comments;
drop policy if exists "Admins can read all comments" on public.comments;
drop policy if exists "Admins can update comments" on public.comments;
drop policy if exists "Public can read approved comments" on public.comments;
drop policy if exists "Public can submit comments" on public.comments;

drop policy if exists "Admins can read own admin record" on public.knowledge_admins;

-- 4. Posts: public read, admin manage
create policy "Anyone can read posts"
on public.posts
for select to anon, authenticated
using (true);

create policy "Admins can publish posts"
on public.posts
for insert to authenticated
with check (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

create policy "Admins can update posts"
on public.posts
for update to authenticated
using (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

create policy "Admins can delete posts"
on public.posts
for delete to authenticated
using (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

-- 5. Comments: public submission, admin moderation
create policy "Public can read approved comments"
on public.comments
for select to anon, authenticated
using (approved = true);

create policy "Admins can read all comments"
on public.comments
for select to authenticated
using (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

create policy "Public can submit comments"
on public.comments
for insert to anon, authenticated
with check (
  approved = false
  and char_length(trim(author)) between 1 and 60
  and char_length(trim(body)) between 1 and 2000
  and exists (
    select 1 from public.posts p
    where p.id = post_id
  )
);

create policy "Admins can update comments"
on public.comments
for update to authenticated
using (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

create policy "Admins can delete comments"
on public.comments
for delete to authenticated
using (
  exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

-- 6. Admins can read only their own admin record
create policy "Admins can read own admin record"
on public.knowledge_admins
for select to authenticated
using (user_id = auth.uid());

-- 7. Storage bucket
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'knowledge-images',
  'knowledge-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- 8. Storage policies
drop policy if exists "Public can view knowledge images" on storage.objects;
drop policy if exists "Public can upload knowledge images" on storage.objects;
drop policy if exists "Admins can delete knowledge images" on storage.objects;
drop policy if exists "Admins can upload knowledge images" on storage.objects;
drop policy if exists "Admins can update knowledge images" on storage.objects;

create policy "Public can view knowledge images"
on storage.objects
for select to anon, authenticated
using (bucket_id = 'knowledge-images');

create policy "Admins can upload knowledge images"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'knowledge-images'
  and exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

create policy "Admins can update knowledge images"
on storage.objects
for update to authenticated
using (
  bucket_id = 'knowledge-images'
  and exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'knowledge-images'
  and exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);

create policy "Admins can delete knowledge images"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'knowledge-images'
  and exists (
    select 1 from public.knowledge_admins a
    where a.user_id = auth.uid()
  )
);
