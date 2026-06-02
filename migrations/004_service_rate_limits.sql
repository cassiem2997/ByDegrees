create table if not exists service_rate_limits (
  service text primary key,
  retry_after_until timestamptz not null,
  last_retry_after_seconds integer,
  updated_at timestamptz not null default now()
);
