create extension if not exists "pgcrypto";

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists temperature_presets (
  id uuid primary key default gen_random_uuid(),
  template_key text not null default 'temp-core-v1',
  label text not null,
  min_temp integer,
  max_temp integer,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'spotify',
  provider_track_id text not null unique,
  title text not null,
  artist_name text not null,
  album_name text not null,
  album_art_url text not null,
  external_url text not null,
  preview_url text,
  created_at timestamptz not null default now()
);

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  artist_name text not null,
  artist_id uuid references artists(id) on delete set null,
  template_key text not null default 'temp-core-v1',
  is_public boolean not null default true,
  aspect_ratio text not null default 'portrait',
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists board_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  temperature_preset_id uuid not null references temperature_presets(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  slot_index integer not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (board_id, temperature_preset_id, slot_index)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid,
  session_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_type_date on events(event_type, created_at desc);
create index if not exists idx_events_session on events(session_id);
create index if not exists idx_boards_slug on boards(slug);
create index if not exists idx_boards_internal_created_at on boards(is_internal, created_at desc);
create index if not exists idx_board_items_board on board_items(board_id);

insert into temperature_presets (id, template_key, label, min_temp, max_temp, sort_order)
values
  ('11111111-1111-4111-8111-111111111111', 'temp-core-v1', '28°C+', 28, null, 1),
  ('22222222-2222-4222-8222-222222222222', 'temp-core-v1', '27~23°C', 23, 27, 2),
  ('33333333-3333-4333-8333-333333333333', 'temp-core-v1', '22~20°C', 20, 22, 3),
  ('44444444-4444-4444-8444-444444444444', 'temp-core-v1', '19~17°C', 17, 19, 4),
  ('55555555-5555-4555-8555-555555555555', 'temp-core-v1', '16~12°C', 12, 16, 5),
  ('66666666-6666-4666-8666-666666666666', 'temp-core-v1', '11~9°C', 9, 11, 6),
  ('77777777-7777-4777-8777-777777777777', 'temp-core-v1', '8~5°C', 5, 8, 7),
  ('88888888-8888-4888-8888-888888888888', 'temp-core-v1', '4°C-', null, 4, 8)
on conflict do nothing;
