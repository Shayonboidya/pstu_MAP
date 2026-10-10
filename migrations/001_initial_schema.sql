-- PSTU Campus Map - Database Schema
-- Secure database setup with Row Level Security (RLS)

-- ==========================================
-- Extensions
-- ==========================================
create extension if not exists "uuid-ossp";

-- ==========================================
-- Custom Types
-- ==========================================
-- Location status types
create type if not exists location_status as enum ('approved', 'pending', 'rejected');

-- ==========================================
-- Tables
-- ==========================================

-- Categories table: Stores location categories with icons and colors
create table if not exists categories (
  id uuid primary key default uuid_ossp.uuid_generate_v4(),
  name varchar(100) not null unique,
  icon varchar(50) not null default '📍',
  color varchar(20) not null default '#10b981',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles table: Extends auth.users with additional user data
-- WARNING: role field is set by the application on signup, NOT by user input
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(255),
  role varchar(20) not null default 'user',  -- Default to 'user', NOT 'visitor'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Locations table: Approved campus locations
create table if not exists locations (
  id uuid primary key default uuid_ossp.uuid_generate_v4(),
  name varchar(255) not null,
  description text,
  category_id uuid references categories(id) on set null,
  latitude double precision not null check (latitude >= -90 and latitude <= 90),
  longitude double precision not null check (longitude >= -180 and longitude <= 180),
  address text,
  image_url text,
  opening_hours varchar(100),
  contact_information varchar(200),
  status location_status default 'approved',  -- Default to 'approved' for initial data
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Location Submissions table: User-submitted locations for admin review
create table if not exists location_submissions (
  id uuid primary key default uuid_ossp.uuid_generate_v4(),
  name varchar(255) not null,
  description text,
  category_id uuid references categories(id) on set null,
  latitude double precision not null check (latitude >= -90 and latitude <= 90),
  longitude double precision not null check (longitude >= -180 and longitude <= 180),
  address text,
  image_url text,
  opening_hours varchar(100),
  contact_information varchar(200),
  submitted_by uuid references auth.users(id) on delete set null,
  review_status varchar(20) not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- Indexes for Performance
-- ==========================================
create index if not exists idx_locations_category_id on locations(category_id);
create index if not exists idx_locations_status on locations(status);
create index if not exists idx_locations_created_by on locations(created_by);
create index if not exists idx_locations_name on locations(name);
create index if not exists idx_locations_coordinates on locations(latitude, longitude);

create index if not exists idx_location_submissions_submitted_by on location_submissions(submitted_by);
create index if not exists idx_location_submissions_review_status on location_submissions(review_status);
create index if not exists idx_profiles_role on profiles(role);

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table locations enable row level security;
alter table location_submissions enable row level security;

-- ==========================================
-- Profiles Policies
-- ==========================================
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Only admins can manage all profiles
-- IMPORTANT: This does NOT grant privilege escalation; role must be 'admin' already
create policy "Admins can manage all profiles"
  on profiles for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- ==========================================
-- Categories Policies
-- ==========================================
-- Anyone can view categories (needed for location forms)
create policy "Anyone can view categories"
  on categories for select
  to anonymous, authenticated
  using (true);

-- Only admins can manage categories
create policy "Admins can manage categories"
  on categories for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- ==========================================
-- Locations Policies
-- ==========================================
-- Anyone (including anonymous) can view approved locations
create policy "Anyone can view approved locations"
  on locations for select
  to anonymous, authenticated
  using (status = 'approved');

-- Authenticated users can view their own locations (even if pending)
create policy "Users can view own locations"
  on locations for select
  using (auth.uid() = created_by);

-- Only admins can create/update/delete all locations
-- Users must use location_submissions table instead
create policy "Admins can manage all locations"
  on locations for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- ==========================================
-- Location Submissions Policies
-- ==========================================
-- Users can view their own submissions
create policy "Users can view own submissions"
  on location_submissions for select
  using (auth.uid() = submitted_by);

-- Authenticated users can create submissions
-- The submitted_by field is set by the application, NOT from user input
create policy "Authenticated users can create submissions"
  on location_submissions for insert
  with check (auth.uid() IS NOT NULL);

-- Admins can manage (view, update) all submissions
create policy "Admins can manage all submissions"
  on location_submissions for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- ==========================================
-- Security Functions
-- ==========================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger for locations table
create trigger update_locations_updated_at
  before update on locations
  for each row
  execute function update_updated_at_column();

-- ==========================================
-- Default Data
-- ==========================================

-- Insert default categories (safe to run multiple times)
insert into categories (name, icon, color) values
  ('Academic Buildings', '🏫', '#3b82f6'),
  ('Administrative Buildings', '🏢', '#8b5cf6'),
  ('Departments and Laboratories', '🔬', '#ec4899'),
  ('Student Halls and Hostels', ' dormitory ', '#f59e0b'),
  ('Library', '📚', '#6366f1'),
  ('Cafeteria and Food', '🍔', '#ef4444'),
  ('Mosque and Prayer Facilities', '🕌', '#10b981'),
  ('Sports and Recreation', '⚽', '#14b8a6'),
  ('Main Gate and Entrances', '🚪', '#f97316'),
  ('Medical Facilities', '🏥', '#f43f5e'),
  ('Transport and Parking', ' 🚗 ', '#0ea5e9'),
  ('Other Places', '📍', '#64748b')
on conflict (name) do nothing;

-- ==========================================
-- Comments
-- ==========================================
comment on table locations is 'Campus locations - only admins can manage. Public can view approved locations.';
comment on table location_submissions is 'User-submitted locations pending admin review';
comment on table profiles is 'User profiles - extends auth.users. Role field set by app, not user input.';
comment on column profiles.role is 'User role: user (default) or admin. NOT settable by user through normal signup.';
