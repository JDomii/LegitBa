create table verified_records (
  id uuid primary key default gen_random_uuid(),
  sha256 text not null unique check (sha256 ~ '^[0-9a-f]{64}$'),
  title text not null check (char_length(title) between 1 and 120),
  file_name text not null,
  storage_path text not null,
  stamped_by text not null default 'Registrar Office',
  stamped_at timestamptz not null default now()
);

create type report_status as enum ('reported', 'under_review', 'resolved');

create table reports (
  id uuid primary key default gen_random_uuid(),
  sha256 text not null unique check (sha256 ~ '^[0-9a-f]{64}$'),
  file_name text not null,
  storage_path text not null,
  note text check (note is null or char_length(note) <= 280),
  status report_status not null default 'reported',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_created_at_idx on reports (created_at desc);

-- Row level security is on with NO policies, on purpose.
-- Only the server (service role key) reads or writes these tables.
alter table verified_records enable row level security;
alter table reports enable row level security;

insert into storage.buckets (id, name, public) values
  ('official-files', 'official-files', false),
  ('report-files', 'report-files', false)
on conflict (id) do nothing;
