-- ============================================================
-- Luminary — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── photos ───────────────────────────────────────────────────
create table if not exists photos (
  id             uuid primary key default uuid_generate_v4(),
  user_id        text not null,          -- Clerk user ID
  name           text not null,          -- person's name
  occasion       text,
  description    text,
  date           date,
  tags           text[] default '{}',
  favorite       boolean default false,
  cloudinary_id  text not null,
  url            text not null,
  width          integer,
  height         integer,
  created_at     timestamptz default now()
);

-- Index for fast user lookups and search
create index if not exists photos_user_id_idx  on photos(user_id);
create index if not exists photos_occasion_idx on photos(occasion);
create index if not exists photos_name_idx     on photos(name);
create index if not exists photos_tags_idx     on photos using gin(tags);

-- Full-text search index
alter table photos add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(occasion, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      array_to_string(tags, ' ')
    )
  ) stored;

create index if not exists photos_search_idx on photos using gin(search_vector);

-- ── albums ───────────────────────────────────────────────────
create table if not exists albums (
  id              uuid primary key default uuid_generate_v4(),
  user_id         text not null,
  name            text not null,
  description     text,
  cover_photo_id  uuid references photos(id) on delete set null,
  created_at      timestamptz default now()
);

create index if not exists albums_user_id_idx on albums(user_id);

-- ── album_photos (join table) ─────────────────────────────────
create table if not exists album_photos (
  album_id   uuid references albums(id) on delete cascade,
  photo_id   uuid references photos(id) on delete cascade,
  primary key (album_id, photo_id)
);

-- ── Row Level Security ─────────────────────────────────────────
-- Each user can only see/edit their own data.
-- We pass the Clerk user_id via a custom JWT claim or service role.

alter table photos       enable row level security;
alter table albums       enable row level security;
alter table album_photos enable row level security;

-- For the API routes we use the service role key which bypasses RLS.
-- These policies protect direct client access if you ever use anon key.
create policy "Users see own photos"   on photos for all using (user_id = current_user);
create policy "Users see own albums"   on albums for all using (user_id = current_user);
create policy "Album photos follow album" on album_photos for all
  using (album_id in (select id from albums where user_id = current_user));
