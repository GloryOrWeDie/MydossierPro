-- Profiles table: links auth.users to Pro status (for Upgrade to Pro)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_pro boolean not null default false,
  pro_expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Service role can do everything (for webhook, profile setup)
create policy "Service role full access profiles"
  on public.profiles for all
  using (true)
  with check (true);

-- Allow insert for own id (on signup we insert from API with service role)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create index if not exists idx_profiles_is_pro on public.profiles(is_pro);

comment on table public.profiles is 'User profiles: Pro status and expiry for Upgrade to Pro';

-- Create profile on signup (trigger on auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger runs after a new user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
