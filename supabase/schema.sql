create extension if not exists pgcrypto;

create table if not exists public.official_sources (
  id uuid primary key default gen_random_uuid(),
  state_code text not null,
  source_type text not null check (source_type in ('dmv_website', 'manual_page', 'manual_pdf', 'road_test_page', 'contact_page')),
  title text not null,
  url text not null,
  status text not null default 'needs_review' check (status in ('ready', 'needs_review', 'broken')),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  failure_count integer not null default 0,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_checks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.official_sources(id) on delete cascade,
  status_code integer,
  ok boolean not null default false,
  error_message text,
  checked_at timestamptz not null default now()
);

create table if not exists public.manual_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.official_sources(id) on delete cascade,
  state_code text not null,
  title text not null,
  content text not null,
  page_url text,
  chunk_index integer not null default 0,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  state_code text not null,
  city text,
  dmv_location text,
  topic text not null check (topic in ('road_test', 'parking', 'permit_test', 'documents', 'general')),
  source_type text not null check (source_type in ('user_submitted', 'public_web', 'reddit_like')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  upvotes integer not null default 0,
  source_url text,
  source_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience_search_cache (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  state_code text,
  city text,
  result_json jsonb not null,
  provider text not null default 'openai_web_search',
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  state_code text not null,
  mode text not null check (mode in ('practice', 'real_exam', 'road_signs', 'mistake_review')),
  topic text not null check (topic in ('rules_of_road', 'signs', 'parking', 'safety', 'documents', 'mixed')),
  question text not null,
  choices jsonb not null,
  correct_answer_index integer not null,
  explanation text not null,
  official_source_id uuid references public.official_sources(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists official_sources_state_code_idx on public.official_sources(state_code);
create index if not exists official_sources_status_idx on public.official_sources(status);
create index if not exists manual_chunks_state_code_idx on public.manual_chunks(state_code);
create index if not exists experience_posts_state_code_idx on public.experience_posts(state_code);
create index if not exists experience_posts_location_idx on public.experience_posts(state_code, city, dmv_location);
create index if not exists experience_search_cache_lookup_idx on public.experience_search_cache(query, state_code, city);
create index if not exists experience_search_cache_expires_idx on public.experience_search_cache(expires_at);

alter table public.official_sources enable row level security;
alter table public.source_checks enable row level security;
alter table public.manual_chunks enable row level security;
alter table public.experience_posts enable row level security;
alter table public.experience_search_cache enable row level security;
alter table public.practice_questions enable row level security;

create policy "Public can read approved experience posts"
  on public.experience_posts
  for select
  using (moderation_status = 'approved');

create policy "Public can insert pending experience posts"
  on public.experience_posts
  for insert
  with check (moderation_status = 'pending');

create policy "Public can read published practice questions"
  on public.practice_questions
  for select
  using (status = 'published');

create policy "Public can read ready official sources"
  on public.official_sources
  for select
  using (status = 'ready');

create policy "Public can read manual chunks"
  on public.manual_chunks
  for select
  using (true);
