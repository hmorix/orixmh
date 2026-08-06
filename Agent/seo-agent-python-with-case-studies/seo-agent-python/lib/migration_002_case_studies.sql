-- Run this in Supabase Dashboard → SQL Editor (after lib/db.sql and
-- lib/migration_001_seo_columns.sql have already been run).
--
-- Adds two tables mirroring blog_drafts / blog_posts, but for case studies.
-- Kept as SEPARATE tables (not just another blog content_type) because case
-- studies carry a different, structured set of fields — client identity,
-- results metrics, testimonial, gallery images — that don't belong on a
-- generic blog row.
--
-- IMPORTANT: every "client-facing fact" column here (client_name, industry,
-- challenge, solution, results, testimonial_*) is expected to hold REAL data
-- you provide, or an explicit placeholder like "[Client Name]" while
-- is_demo = true. Nothing in this app invents values for these columns.

create extension if not exists "pgcrypto";

create table if not exists case_study_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content jsonb not null,           -- [{type: "paragraph"|"heading"|"list"|"table", text/items/headers/rows}]
  category text default 'Case Study',
  author text default 'HMorix',
  author_role text default 'Case Studies Team',
  read_time text,

  -- Client / project identity — placeholders allowed, never invented.
  is_demo boolean default true,     -- true until real client data replaces the placeholders
  client_name text,                 -- e.g. "[Client Name]" or a real, permissioned name
  client_logo_url text,
  industry text,
  company_size text,
  location text,
  service_used text,                -- which HMorix service/product (must match knowledge/products.md)
  timeline text,                    -- e.g. "[Project Timeline]"

  -- Narrative fields (LLM-written, but only elaborating on facts you supplied)
  challenge text,
  solution text,

  -- Results: array of {metric, value, label, is_placeholder}. Real numbers
  -- only when is_placeholder = false.
  results jsonb,

  testimonial_quote text,
  testimonial_author text,
  testimonial_role text,

  -- Media slots
  hero_image_url text,
  gallery_images jsonb,             -- array of {url, alt, caption}

  cta_text text,
  cta_url text,

  reference_links jsonb,             -- [{label, url}] -- e.g. client site, live project, LinkedIn post

  seo_title text,
  meta_description text,
  canonical_url text,
  open_graph jsonb,
  twitter_card jsonb,
  breadcrumbs jsonb,
  keywords text[],
  schema_jsonld jsonb,
  seo_score int,
  flagged_claims jsonb,
  word_count int,

  status text default 'pending',    -- pending | approved | rejected
  created_at timestamptz default now()
);

create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null,
  category text default 'Case Study',
  author text default 'HMorix',
  author_role text,
  read_time text,

  is_demo boolean default true,
  client_name text,
  client_logo_url text,
  industry text,
  company_size text,
  location text,
  service_used text,
  timeline text,

  challenge text,
  solution text,
  results jsonb,

  testimonial_quote text,
  testimonial_author text,
  testimonial_role text,

  hero_image_url text,
  gallery_images jsonb,

  cta_text text,
  cta_url text,

  reference_links jsonb,             -- [{label, url}] -- e.g. client site, live project, LinkedIn post

  seo_title text,
  meta_description text,
  canonical_url text,
  open_graph jsonb,
  twitter_card jsonb,
  breadcrumbs jsonb,
  keywords text[],
  schema_jsonld jsonb,
  featured boolean default false,
  word_count int,

  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_case_studies_slug on case_studies (slug);
create index if not exists idx_case_studies_is_demo on case_studies (is_demo);
create index if not exists idx_case_study_drafts_status on case_study_drafts (status);

-- Idempotent upgrade path for anyone who ran this migration before
-- reference_links existed — safe to re-run any time.
alter table case_study_drafts add column if not exists reference_links jsonb;
alter table case_studies add column if not exists reference_links jsonb;

alter table case_study_drafts enable row level security;
alter table case_studies enable row level security;

create policy "public read published case studies"
  on case_studies for select
  using (true);

-- No public policy on case_study_drafts — only the service role touches it.

-- Explicit grants. Normally Supabase sets these up automatically when a
-- project is created, but if you're seeing "permission denied for schema
-- public" (SQLSTATE 42501) even with a correct service_role key, those
-- project-level grants are missing/broken and these lines fix it. Safe to
-- re-run any time.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on case_study_drafts, case_studies to postgres, service_role;
grant select on case_studies to anon, authenticated;
grant usage, select on all sequences in schema public to postgres, service_role;
