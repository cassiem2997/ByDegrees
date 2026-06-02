create table if not exists maintenance_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_maintenance_subscribers_notified
  on maintenance_subscribers(notified_at, created_at desc);
