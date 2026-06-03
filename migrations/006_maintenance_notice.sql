create table if not exists maintenance_notice (
  id text primary key default 'global',
  active boolean not null default false,
  reason text,
  route text,
  query text,
  error_message text,
  triggered_at timestamptz,
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into maintenance_notice (id, active)
values ('global', false)
on conflict (id) do nothing;
