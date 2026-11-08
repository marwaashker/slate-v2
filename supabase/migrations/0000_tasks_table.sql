create table tasks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  priority text not null  default 'medium',
  column_id text not null,
  done boolean not null default false,
  position integer not null  default 0,
  user_id text not null,
  created_at timestamptz default now()  
);
