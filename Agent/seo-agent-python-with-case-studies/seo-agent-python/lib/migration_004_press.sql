-- Run in Supabase Dashboard -> SQL Editor, after the other migrations.
-- Same fabrication-safety posture as white papers: claims about a real
-- third-party company must trace to a `sources` entry when is_commentary
-- is true. Quotes are NEVER invented — quote_text/quote_attribution must
-- be supplied by you or left blank (renders as a placeholder).

create table if not exists press_drafts (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  slug text not null,
  subheadline text,
  category text default 'Company News',   -- Product Launch | Partnership | Industry Commentary | Company News | Award | Hire
  dateline_city text,
  dateline_date text,
  excerpt text,

  is_commentary boolean default false,    -- true if it discusses/cites other real companies
  content jsonb not null,                 -- body paragraphs/lists, same block shape as blog/case-study
  key_facts text[],
  sources jsonb,                          -- [{title, url, snippet}]

  quote_text text,
  quote_attribution text,
  quote_role text,

  boilerplate text,                       -- "About HMorix" paragraph, grounded in knowledge/company.md
  media_contact_name text,
  media_contact_email text,
  media_contact_phone text,

  cover_image_url text,
  reference_links jsonb,
  cta_text text,
  cta_url text,

  author text default 'HMorix',
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

create table if not exists press_releases (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  slug text unique not null,
  subheadline text,
  category text default 'Company News',
  dateline_city text,
  dateline_date text,
  excerpt text,

  is_commentary boolean default false,
  content jsonb not null,
  key_facts text[],
  sources jsonb,

  quote_text text,
  quote_attribution text,
  quote_role text,

  boilerplate text,
  media_contact_name text,
  media_contact_email text,
  media_contact_phone text,

  cover_image_url text,
  reference_links jsonb,
  cta_text text,
  cta_url text,

  author text default 'HMorix',
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

  pdf_url text,
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_press_releases_slug on press_releases (slug);
create index if not exists idx_press_drafts_status on press_drafts (status);

alter table press_drafts enable row level security;
alter table press_releases enable row level security;

create policy "public read published press releases"
  on press_releases for select
  using (true);

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on press_drafts, press_releases to postgres, service_role;
grant select on press_releases to anon, authenticated;
