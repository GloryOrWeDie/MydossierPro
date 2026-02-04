-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
drop table if exists public.profile_views;
drop table if exists public.documents;
drop table if exists public.tenants;

-- Tenants table
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  phone text,
  city text,
  unique_slug text unique,
  stripe_payment_intent_id text,
  stripe_session_id text,
  paid boolean default false,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '90 days'),
  
  -- Constraints
  constraint email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint full_name_length check (char_length(full_name) >= 2),
  constraint city_length check (city is null or char_length(city) >= 2)
);

-- Documents table
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  document_type text not null,
  uploaded_at timestamp with time zone default now(),
  
  -- Constraints
  constraint document_type_check check (document_type in ('pay_stub', 'lease', 'id')),
  constraint file_size_check check (file_size > 0 and file_size <= 5242880), -- 5MB max
  constraint file_type_check check (file_type in ('application/pdf', 'image/jpeg', 'image/jpg', 'image/png'))
);

-- Profile views table (analytics)
create table public.profile_views (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  viewed_at timestamp with time zone default now(),
  ip_address text,
  user_agent text
);

-- Indexes for performance
create index idx_tenants_email on public.tenants(email);
create index idx_tenants_slug on public.tenants(unique_slug);
create index idx_tenants_paid on public.tenants(paid);
create index idx_documents_tenant on public.documents(tenant_id);
create index idx_documents_type on public.documents(document_type);
create index idx_views_tenant on public.profile_views(tenant_id);
create index idx_views_date on public.profile_views(viewed_at desc);

-- Enable Row Level Security
alter table public.tenants enable row level security;
alter table public.documents enable row level security;
alter table public.profile_views enable row level security;

-- RLS Policies: Public read access (for viewing profiles)
create policy "Public read access for tenants"
  on public.tenants for select
  using (true);

create policy "Public read access for documents"
  on public.documents for select
  using (true);

-- Service role can do everything
create policy "Service role full access tenants"
  on public.tenants for all
  using (true)
  with check (true);

create policy "Service role full access documents"
  on public.documents for all
  using (true)
  with check (true);

-- Anyone can insert profile views
create policy "Public insert for views"
  on public.profile_views for insert
  with check (true);

create policy "Public read for views"
  on public.profile_views for select
  using (true);

-- Comments for documentation
comment on table public.tenants is 'Stores tenant information and payment status';
comment on table public.documents is 'Stores uploaded document metadata';
comment on table public.profile_views is 'Tracks profile page views for analytics';
comment on column public.tenants.unique_slug is 'URL-friendly unique identifier (e.g., john-smith-a3f9d)';
comment on column public.tenants.expires_at is 'Link expiration date (90 days from creation)';
comment on column public.documents.document_type is 'Type of document: pay_stub, lease, or id';
