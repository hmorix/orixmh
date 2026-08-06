-- Run this in Supabase Dashboard -> SQL Editor if you're seeing:
--   "permission denied for schema public" (SQLSTATE 42501)
-- even though SUPABASE_SERVICE_KEY is the correct service_role key.
--
-- This means the project-level grants Supabase normally sets up
-- automatically are missing or were reset. This restores them for
-- every table that currently exists in the public schema, plus sets
-- the default so future tables get them too. Safe to re-run any time.

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;

grant usage, select on all sequences in schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables to postgres, service_role;
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to postgres, service_role;
