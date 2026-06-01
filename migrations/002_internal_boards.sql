alter table boards
  add column if not exists is_internal boolean not null default false;

create index if not exists idx_boards_internal_created_at
  on boards(is_internal, created_at desc);
