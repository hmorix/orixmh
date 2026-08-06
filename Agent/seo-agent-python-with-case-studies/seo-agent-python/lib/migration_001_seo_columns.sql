-- Run this in Supabase Dashboard → SQL Editor, then reload the schema cache
-- (Settings → API → "Reload schema") so PostgREST picks up the new columns.
--
-- Why: daily_blog.py / seo_optimizer.py produce canonical_url, open_graph,
-- twitter_card, and breadcrumbs for every post, and publish.py writes the
-- same record into blog_posts — but the original db.sql never defined these
-- columns on either table, causing PGRST204 "column not found" on insert/upsert.

alter table blog_drafts
  add column if not exists canonical_url text,
  add column if not exists open_graph jsonb,
  add column if not exists twitter_card jsonb,
  add column if not exists breadcrumbs jsonb;

alter table blog_posts
  add column if not exists canonical_url text,
  add column if not exists open_graph jsonb,
  add column if not exists twitter_card jsonb,
  add column if not exists breadcrumbs jsonb,
  add column if not exists content_type text default 'blog';

NOTIFY pgrst, 'reload schema';
