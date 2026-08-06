-- Run in Supabase Dashboard -> SQL Editor. Optional: image sets work fine
-- purely from local files even without this — Supabase just adds a
-- searchable history across devices.

create table if not exists generated_image_sets (
  id uuid primary key default gen_random_uuid(),
  source_type text,             -- 'blog' | 'case-study' | 'whitepaper' | 'press' | 'custom'
  source_slug text,             -- slug of the content this was generated for, or null for custom prompts
  title text,
  base_prompt text,             -- the custom prompt, if source_type = 'custom'
  images jsonb not null,        -- [{filename, prompt, url}]
  captions jsonb,               -- {instagram: {...}, linkedin: {...}, ...}
  created_at timestamptz default now()
);

create index if not exists idx_generated_image_sets_created on generated_image_sets (created_at desc);

alter table generated_image_sets enable row level security;

create policy "public read generated image sets"
  on generated_image_sets for select
  using (true);

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on generated_image_sets to postgres, service_role;
grant select on generated_image_sets to anon, authenticated;
