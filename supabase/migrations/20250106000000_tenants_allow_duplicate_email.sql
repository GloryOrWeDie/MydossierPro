-- Allow multiple tenants (dossiers) per email, up to the free tier limit of 3.
-- Drop the unique constraint on tenants.email so the same email can create multiple dossiers.
alter table public.tenants drop constraint if exists tenants_email_key;
create index if not exists idx_tenants_email on public.tenants(email);
