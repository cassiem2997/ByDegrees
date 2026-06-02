create table if not exists music_search_cache (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  search_kind text not null,
  cache_key text not null,
  results jsonb not null,
  expires_at timestamptz not null,
  stale_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, search_kind, cache_key)
);

create index if not exists idx_music_search_cache_lookup
  on music_search_cache(provider, search_kind, cache_key, expires_at, stale_until);

create index if not exists idx_music_search_cache_stale_until
  on music_search_cache(stale_until);
