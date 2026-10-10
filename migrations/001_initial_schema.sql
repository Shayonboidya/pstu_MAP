-- pstu-campus-map SQL Migration
-- This migration creates the database schema for the PSTU Interactive Campus Map

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Categories table
create table if not exists categories (
  id uuid primary key default uuid_ossp.uuid_generate_v4(),
  name varchar(100) not null unique,
  icon varchar(50) not null default '📍',
  color varchar(20) not null default '#10b981',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default categories
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

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(255),
  role varchar(20) not null default 'visitor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Location status type
create type location_status as enum ('approved', 'pending', 'rejected');

-- Locations table
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
  status location_status default 'pending',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Location submissions table
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

-- Indexes for better performance
create index if not exists idx_locations_category_id on locations(category_id);
create index if not exists idx_locations_status on locations(status);
create index if not exists idx_locations_created_by on locations(created_by);
create index if not exists idx_locations_name on locations(name);
create index if not exists idx_locations_coordinates on locations(latitude, longitude);

create index if not exists idx_location_submissions_submitted_by on location_submissions(submitted_by);
create index if not exists idx_location_submissions_review_status on location_submissions(review_status);

-- RLS Policies

-- Profiles policies
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on profiles for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- Categories policies
alter table categories enable row level security;

create policy "Anyone can view categories"
  on categories for select
  to anonymous, authenticated
  using (true);

create policy "Admins can manage categories"
  on categories for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- Locations policies
alter table locations enable row level security;

create policy "Anyone can view approved locations"
  on locations for select
  to anonymous, authenticated
  using (status = 'approved');

create policy "Users can view their own locations"
  on locations for select
  using (created_by = auth.uid());

create policy "Admins can manage all locations"
  on locations for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- Location submissions policies
alter table location_submissions enable row level security;

create policy "Users can view own submissions"
  on location_submissions for select
  using (submitted_by = auth.uid());

create policy "Users can create submissions"
  on location_submissions for insert
  with check (auth.uid() is not null);

create policy "Admins can manage all submissions"
  on location_submissions for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role = 'admin'
    )
  );

-- Functions for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger for locations updated_at
create trigger update_locations_updated_at
  before update on locations
  for each row
  execute function update_updated_at_column();

-- Comment
comment on table locations is 'Campus locations with verified coordinates';
comment on table location_submissions is 'User-submitted locations pending admin review';
