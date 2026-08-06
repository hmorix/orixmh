-- Run in Supabase Dashboard -> SQL Editor, after lib/db.sql and
-- lib/migration_002_case_studies.sql.
--
-- Same fabrication-safety posture as case studies: any claim about a real
-- third-party company must trace back to a `sources` entry (a real URL,
-- either researched live via lib/google_search.py or supplied by you) —
-- the writer agent is instructed to cite rather than assert from memory.

create table if not exists whitepaper_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  topic text,
  excerpt text,
  target_audience text,
  is_research boolean default false,   -- true if it discusses/cites other real companies

  content jsonb not null,              -- [{type, text/items/headers/rows}] — same shape as blog/case-study content
  key_facts text[],                    -- facts the user supplied directly (not researched)
  sources jsonb,                       -- [{title, url, snippet}] — every third-party claim must trace to one of these
  stats jsonb,                         -- [{label, value, source}] — real numbers only, each with a source
  comparison_table jsonb,              -- {headers: [...], rows: [[...]]}
  related_whitepapers text[],          -- slugs of other whitepapers to cross-link (backlinks)

  cover_image_url text,
  images jsonb,                        -- [{url, caption}] -- supporting visuals page
  cta_text text,
  cta_url text,
  reference_links jsonb,

  author text default 'HMorix',
  author_role text,
  read_time text,
  word_count int,

  seo_title text,
  meta_description text,
  canonical_url text,
  open_graph jsonb,
  twitter_card jsonb,
  breadcrumbs jsonb,
  keywords text[],
  schema_jsonld jsonb,
  seo_score int,

  pdf_generated boolean default false,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists whitepapers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  topic text,
  excerpt text,
  target_audience text,
  is_research boolean default false,

  content jsonb not null,
  key_facts text[],
  sources jsonb,
  stats jsonb,
  comparison_table jsonb,
  related_whitepapers text[],

  cover_image_url text,
  images jsonb,
  cta_text text,
  cta_url text,
  reference_links jsonb,

  author text default 'HMorix',
  author_role text,
  read_time text,
  word_count int,

  seo_title text,
  meta_description text,
  canonical_url text,
  open_graph jsonb,
  twitter_card jsonb,
  breadcrumbs jsonb,
  keywords text[],
  schema_jsonld jsonb,

  pdf_url text,                        -- where the generated PDF is hosted, once you upload it somewhere
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_whitepapers_slug on whitepapers (slug);
create index if not exists idx_whitepaper_drafts_status on whitepaper_drafts (status);

alter table whitepaper_drafts add column if not exists images jsonb;
alter table whitepapers add column if not exists images jsonb;

alter table whitepaper_drafts enable row level security;
alter table whitepapers enable row level security;

create policy "public read published whitepapers"
  on whitepapers for select
  using (true);

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on whitepaper_drafts, whitepapers to postgres, service_role;
grant select on whitepapers to anon, authenticated;
