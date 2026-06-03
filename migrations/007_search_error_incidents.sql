create table if not exists search_error_incidents (
  fingerprint text primary key,
  route text not null,
  query text not null,
  error_message text not null,
  error_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  notice_triggered_at timestamptz
);

create index if not exists idx_search_error_incidents_last_seen
  on search_error_incidents(last_seen_at desc);
