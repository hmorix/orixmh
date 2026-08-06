# seo-agent (Python port)

Python port of the core `seo-agent` pipeline (keyword research → competitor
analysis → outline → draft → fact-check → SEO metadata → links/images →
schema/social → save). Standard library only — no `pip install` required.

**Not ported (out of scope for this pass):** long-running cron scheduling.
Use `--now`, `--audit`, `--refresh <post_id>` and trigger them with Termux's
crontab or any external scheduler instead. (A web dashboard *is* included —
see the "Dashboard" section below.)

## Setup

```bash
cp .env.example .env
# edit .env with your real NVIDIA_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
```

**If this `.env` (or its key values) was ever pasted into a chat, shared,
or committed anywhere — rotate both keys before using this in production.**
Supabase dashboard → Project Settings → API → regenerate `service_role`.
NVIDIA build.nvidia.com dashboard → regenerate the API key. Treat any key
that left your machine as compromised, even briefly.

No dependencies to install — `requirements.txt` is present but intentionally
empty (comment-only), just to document that on purpose.

**About that `SUPABASE_SERVICE_KEY`:** it's a JWT from your Supabase
dashboard → Project Settings → API → `service_role` secret — NOT the
database password from a `postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres`
connection string. That connection string is for direct DB access and is
unrelated to the REST API this project talks to. A `401 Invalid API key`
error almost always means this got mixed up.

## Usage

```bash
python index.py --now               # run the daily blog pipeline, then auto-publish
python index.py --audit             # run the weekly staleness audit once
python index.py --refresh <post_id> # run the content-refresh workflow for one post
```

Schedule with Termux's crontab, e.g.:
```
0 6 * * *   cd ~/seo-agent && python index.py --now
0 7 * * 1   cd ~/seo-agent && python index.py --audit
```

## What happens on `--now`

1. Runs the 9-step pipeline, saves the draft locally, then to Supabase (`blog_drafts`).
2. **Auto-publish** (on by default — set `AUTO_PUBLISH=false` to disable):
   upserts the post into `blog_posts` (by slug, so re-runs update rather
   than duplicate), generates its static page, and regenerates
   `sitemap.xml` + `rss.xml` from the current published set.

If you'd rather review drafts before they go live, set `AUTO_PUBLISH=false`
and call `workflows.publish.publish_post(record)` yourself once you're
happy with a draft (there's no review UI in this pass — see "Not ported").

## If a Supabase upload fails after generation

The finished draft is saved locally first, at
`drafts/pending/<timestamp>-<slug>.json`, before the Supabase call is even
attempted — so a dropped connection at the last step never loses a
generated article. Upload it later with:

```bash
python scripts/upload_draft.py "drafts/pending/<file>.json"
# or upload everything pending at once:
python scripts/upload_draft.py --all
```

If auto-publish itself fails (but the draft saved fine), re-run once the
issue's fixed — `upsert_row` is by slug, so it's safe to publish twice.

## Per-post pages and SEO

`scripts/json_to_tsx.py` converts a post record into a standalone TSX page
(`generated/blog-pages/<slug>.tsx`), styled to match the theme in your
uploaded `BlogPost.tsx` — but with data baked in at generation time (no
runtime fetch) and, unlike the original, includes:

- `<SEOHead>` (in `generated/components/SEOHead.tsx`): sets document title,
  meta description, canonical link, Open Graph + Twitter Card tags, and
  injects the JSON-LD `<script>` tag — client-side, no new npm dependency.
- Breadcrumbs, from `seo_optimizer`'s output.
- A "Related articles" section from `internal_linking`'s output.
- Author, published/updated dates, read time — already present in your
  uploaded component's design, now populated statically per post.

**Known limitation, stated plainly:** `SEOHead` sets tags client-side after
React mounts. That's fine for Googlebot (it executes JS before indexing) but
NOT for bots that only fetch raw HTML — Twitter/Facebook/LinkedIn/Slack
preview crawlers typically don't run JS, so social-share preview cards won't
pick these tags up. Real support for that needs the tags in server-rendered
HTML — a prerender/SSG/SSR step, which isn't built here. Ask if you want
that added (e.g. via `vite-plugin-ssg`/`react-snap`, or moving the blog
routes to a framework with SSR).

Copy `generated/blog-pages/`, `generated/components/SEOHead.tsx`, and
`generated/postsIndex.json` into your actual frontend repo (or point
`BLOG_PAGES_OUTPUT_DIR` / `POSTS_INDEX_FILE` at it directly via `.env` so
they land there automatically). `generated/blog-pages/registry.ts` maps
`slug -> lazy-loaded component` for your router.

## Sitemap and RSS

`scripts/generate_sitemap.py` and `scripts/generate_rss.py` query Supabase's
`blog_posts` table directly (source of truth) and regenerate the files from
scratch each time — so a post deleted from Supabase simply won't appear in
the next regeneration. There's no live watcher (no long-running scheduler,
per your earlier choice), so "automatic" here means "current as of the last
`--now`/publish run," not instant-on-delete.

**Why there's no Google Indexing API / sitemap-ping integration:** Google
retired the sitemap ping endpoint in 2023/2024 (it 404s now regardless of
caller); what it actually uses today is an accurate `<lastmod>` in the
sitemap as a crawl-priority signal, which this generates. The Indexing API
needs an OAuth service account + RSA-signed JWTs — that's either a pip
dependency (`google-auth`) or a lot of hand-rolled ASN.1/RSA-signing code in
stdlib for something Google itself has deprioritized. Skipped for now per
your call that sitemap discovery is acceptable — say the word if you want
it added anyway (it'll need `google-auth`, breaking the stdlib-only rule).

## Case studies (client project pages)

A parallel pipeline to the blog one, for `/case-studies/*` pages. **It never
invents client-specific facts.** Every field about a client — name,
industry, results, testimonial — comes only from what you give it; anything
you don't supply is preserved as a visible `[Bracketed Placeholder]` in the
output rather than filled in with something plausible-sounding.

### Setup (one-time)

Run `lib/migration_002_case_studies.sql` in Supabase's SQL editor (after
`lib/db.sql`). This adds `case_study_drafts` and `case_studies` tables.

### Writing a real case study

1. Copy `knowledge/case-study-input-template.json` somewhere, e.g. `drafts/inputs/acme-corp.json`.
2. Fill in whatever you actually know. Leave anything you don't know as the bracketed placeholder — do not guess.
3. Run it:
   ```bash
   python3 index.py --case-study drafts/inputs/acme-corp.json
   # --review to stop after the draft instead of auto-publishing
   # --words 6000 to override the default 10,000-word target
   ```
4. This writes the case study **section by section** (see
   `agent/case_study_writer.py`), generates SEO metadata + JSON-LD
   (`agent/case_study_seo.py`, `agent/case_study_schema.py`), saves a draft
   to `case_study_drafts`, then (unless `--review`) publishes it: upserts
   into `case_studies`, generates a React page
   (`generated/case-study-pages/<slug>.tsx`), and a standalone HTML page
   (`generated/case-study-html/<slug>.html`).
5. Set `"is_demo": false` in your input once every client-facing fact is
   real and you have permission to publish it — this removes the "DEMO /
   SAMPLE PROJECT" banner from the generated pages.

### Standalone HTML output

If you don't want to wire in the React pages, `generated/case-study-html/*.html`
is a fully self-contained page (hero/poster image area, client meta strip,
results grid, long-form content, photo gallery, testimonial block, CTA, full
SEO/OG/Twitter meta + JSON-LD) built from `templates/case-study-template.html`
— you can host these directly. Re-render one on demand:
```bash
python3 scripts/case_study_render.py --slug acme-corp-support-automation
```

### Demo/sample pages

Two placeholder-only sample case studies ship in
`drafts/pending-case-studies/` and their generated output in
`generated/case-study-pages/` and `generated/case-study-html/`, purely to
show the layout. Every client-specific fact in them is a bracketed
placeholder — they are not, and must never be presented as, real results.

## White papers (research-backed PDFs)

A third pipeline, for long-form white papers with a real downloadable PDF.
**Every claim about a real third-party company/statistic must trace to a
source** — either auto-researched via Google Custom Search (reuses the same
CSE setup as `--check-rankings`) or a URL you supply. If nothing is
sourced, the writer sticks to general/HMorix-grounded discussion instead of
asserting facts it can't back up.

### One-time setup

1. Run `lib/migration_003_whitepapers.sql` in Supabase's SQL editor.
2. `pip install reportlab --break-system-packages` — this is the one real
   dependency in the whole project, needed only for the PDF step. Without
   it, everything else (research, writing, SEO, web page, Supabase) still
   works; only the PDF is skipped, with a clear message telling you to
   install it.
3. (Optional, for real research) Set `GOOGLE_CSE_API_KEY` / `GOOGLE_CSE_CX`
   in `.env` — see `lib/google_search.py` for the 5-minute setup. Without
   it, research is skipped and the writer relies only on what you supply
   directly (`key_facts`, `source_urls`, `stats`).

### Generating one

```bash
cp knowledge/whitepaper-input-template.json drafts/inputs/my-topic.json
# fill in topic, target_audience, key_facts, source_urls, stats (with sources!)
python3 index.py --whitepaper drafts/inputs/my-topic.json
# --review to stop after the draft, --words N to change the ~6,000-word default
```

This produces, per white paper: a PDF (`generated/whitepaper-pdfs/<slug>.pdf`
— cover, clickable table of contents, native-drawn diagrams built only from
real supplied data, a sources page with clickable citations, a related-
white-papers backlinks page, and a CTA), a React page
(`generated/whitepaper-pages/<slug>.tsx`), and a standalone HTML page
(`generated/whitepaper-html/<slug>.html`).

### Studio UI

`http://localhost:<PORT>/whitepapers` — upload a JSON file to generate
immediately, or use the guided form (with a "what's missing?" checklist and
per-field "polish" — never invents facts, only tidies your own wording).
Also summarized in the main Control Panel's **White Papers** tab, and
counted on `/dashboard`.

## Dashboard

`http://localhost:<PORT>/dashboard` shows: total case studies, published
count, drafts pending, demo vs. real split, white papers (published, drafts
pending, how many have a PDF), blog post counts, current
pipeline status, and the last few pipeline jobs run. It reads live from
Supabase where possible and falls back to local file counts if Supabase
isn't configured/reachable — it will tell you which mode it's in.

## Structure

```
index.py                    entrypoint (--now / --audit / --refresh)
lib/
  env.py                    minimal .env loader (stdlib, no python-dotenv)
  util.py                   iso_now() date helper
  nvidia.py                 NVIDIA NIM client: streaming, model-chain fallback,
                             wall-clock retry budget (see "Resilience" below)
  supabase.py                minimal PostgREST client (stdlib urllib, no supabase-py)
  db.sql                    unchanged — Supabase table schema reference
agent/                      the 11 pipeline steps (1:1 port of agent/*.js)
workflows/
  daily_blog.py             orchestrates the 9-step pipeline + local-save fallback + auto-publish
  publish.py                promotes a draft to blog_posts, generates its page, regenerates sitemap/RSS
  weekly_audit.py           flags posts >6 months since last update
  content_refresh.py        runs the staleness-check agent on one post
scripts/
  upload_draft.py           manual/retry uploader for locally-saved drafts
  json_to_tsx.py            converts one post record into a static TSX page + registry + postsIndex
  generate_sitemap.py       rebuilds sitemap.xml from Supabase blog_posts
  generate_rss.py           rebuilds rss.xml from Supabase blog_posts
generated/
  components/SEOHead.tsx   shared SEO component (copy into your frontend once)
  blog-pages/               one .tsx per published post + registry.ts
  postsIndex.json           lightweight metadata list (for a /blog listing page)
  sitemap.xml / rss.xml
prompts/ knowledge/ templates/   unchanged markdown, read the same way in Python
```

## Resilience built into `lib/nvidia.py`

This carries forward everything worked out debugging the flaky Termux/mobile
connection in the Node version:

- **No connection pooling** — every request opens a fresh HTTPS connection
  (`http.client.HTTPSConnection` per call, `Connection: close`), which avoids
  a stale reused socket getting silently killed by the network mid-stream.
- **Streaming responses** — keeps the connection actively receiving data
  during long generations (the ~3000-word draft step) instead of one long
  idle wait, which is what tends to get killed by carrier NAT/mobile timeouts.
- **Model fallback chain** — default `meta/llama-4-maverick-17b-128e-instruct
  → nvidia/llama-3.3-nemotron-super-49b-v1 → meta/llama-3.1-70b-instruct →
  meta/llama-3.2-1b-instruct`. A 404 ("not entitled on this account") skips
  straight to the next model; transient errors retry the same model first.
  Override with `NVIDIA_MODEL_CHAIN=a,b,c` in `.env`. NVIDIA's free catalog
  changes with little notice — if a model in the chain stops working, swap
  it via the env var rather than editing code.
- **Wall-clock retry budget, not a fixed attempt count** — keeps cycling the
  whole chain, round after round, for up to `NVIDIA_MAX_WAIT_MS` (default
  12 minutes) before giving up for real.

## Known simplifications vs. the Node version

- `weekly_audit.py`'s "6 months ago" date math clamps the day-of-month to 28
  to sidestep month-length edge cases — fine for a staleness threshold, not
  exact to the day in every case.
- `agent/social_post_generator.py` and the JS version both accept an `seo`
  parameter that's never actually used in the prompt — kept for call-site
  parity rather than "fixed", since that's how the original was written.
- The pipeline generates blog-style content only. `schema_generator`'s
  JSON-LD defaults to `BlogPosting`; if you want genuinely separate
  press-release/news-article workflows with different structures, that's a
  larger follow-up, not something this pass adds.
