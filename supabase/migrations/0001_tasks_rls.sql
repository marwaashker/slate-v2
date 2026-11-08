
create or replace function public.requesting_user_id()
returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;
alter table tasks enable row level security;

create policy "users can only see own tasks"
  on tasks for select
  using (user_id = requesting_user_id());

create policy "users can only insert own tasks"
  on tasks for insert
  with check (user_id = requesting_user_id());

create policy "users can only update own tasks"
  on tasks for update
  using (user_id = requesting_user_id());

create policy "users can only delete own tasks"
  on tasks for delete
  using (user_id = requesting_user_id());
