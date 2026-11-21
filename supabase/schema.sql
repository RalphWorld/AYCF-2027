-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Paste all of this and click Run.

create extension if not exists pgcrypto;

-- Holds the site-wide key and admin key, as bcrypt hashes. Always exactly one row.
create table if not exists site_config (
  id int primary key default 1,
  site_key_hash text not null,
  admin_key_hash text not null,
  constraint single_row check (id = 1)
);

-- One row per group leader group (e.g. "Group 1", "Group 2", ...).
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'Not started',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Each group's private 6-digit key, stored hashed. One-to-one with groups.
create table if not exists group_keys (
  group_id uuid primary key references groups(id) on delete cascade,
  key_hash text not null
);

-- Announcements feed. The newest row with is_live_banner = true is shown as the
-- pinned "happening now" banner; older ones just sit in the feed below it.
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  is_live_banner boolean not null default false,
  created_at timestamptz not null default now()
);

-- Resource hub links.
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  category text not null default 'General',
  created_at timestamptz not null default now()
);

-- This table starts EMPTY on purpose. After running this script, visit
-- your-site.vercel.app/setup once in your browser to set the first site
-- key and admin key. Never type real keys directly into SQL as plain text.
