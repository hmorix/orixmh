-- Run this whole file in Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

create table if not exists blog_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content jsonb not null,          -- [{type: "paragraph"|"heading"|"code", text: "..."}]
  category text,
  author text default 'HMorix AI',
  author_role text default 'AI Content Agent',
  read_time text,
  seo_title text,
  meta_description text,
  canonical_url text,
  open_graph jsonb,
  twitter_card jsonb,
  breadcrumbs jsonb,
  keywords text[],
  internal_links jsonb,
  external_links jsonb,
  image_prompts jsonb,
  schema_jsonld jsonb,
  social_posts jsonb,
  seo_score int,
  flagged_claims jsonb,             -- fact-checker output: unverifiable statements
  status text default 'pending',    -- pending | approved | rejected
  content_type text default 'blog', -- blog | tutorial | comparison | landing-page
  created_at timestamptz default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null,
  category text,
  author text default 'HMorix AI',
  author_role text,
  read_time text,
  cover_image_url text,
  seo_title text,
  meta_description text,
  canonical_url text,
  open_graph jsonb,
  twitter_card jsonb,
  breadcrumbs jsonb,
  keywords text[],
  schema_jsonld jsonb,
  social_posts jsonb,
  featured boolean default false,
  content_type text default 'blog', -- blog | tutorial | comparison | landing-page
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_blog_posts_slug on blog_posts (slug);
create index if not exists idx_blog_drafts_status on blog_drafts (status);

-- Row Level Security: keep both tables locked down from the public/anon key.
-- The agent + admin dashboard use the SERVICE ROLE key, which bypasses RLS.
alter table blog_drafts enable row level security;
alter table blog_posts enable row level security;

-- Allow anonymous READ on published posts only (for your public blog pages)
create policy "public read published posts"
  on blog_posts for select
  using (true);

-- No public policy on blog_drafts — only the service role can touch it.
