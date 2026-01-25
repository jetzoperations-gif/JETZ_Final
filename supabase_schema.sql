
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. DROP EVERYTHING (Clean Slate) to prevent conflicts
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.job_items cascade;   -- cleanup old table name
drop table if exists public.job_orders cascade;  -- cleanup old table name
drop table if exists public.inventory_items cascade;
drop table if exists public.service_prices cascade;
drop table if exists public.services cascade;
drop table if exists public.vehicle_types cascade;
drop table if exists public.tokens cascade;

-- 3. Create tables
create table if not exists public.tokens (
  id serial primary key,
  status text check (status in ('available', 'active')) default 'available',
  current_job_id uuid -- Will execute foreign key later
);

create table if not exists public.vehicle_types (
  id serial primary key,
  name text not null unique,
  sort_order int default 0
);
-- Seed vehicle types
insert into public.vehicle_types (name, sort_order) values
('Sedan', 1), ('Med', 2), ('SUV', 3), ('XL SUV', 4), ('Van', 5)
on conflict do nothing;

create table if not exists public.services (
  id serial primary key,
  name text not null unique
);
-- Seed services
insert into public.services (name) values
('Basic Wash'), ('Package 1'), ('Package 2')
on conflict do nothing;

create table if not exists public.service_prices (
  id serial primary key,
  service_id int references public.services(id),
  vehicle_type_id int references public.vehicle_types(id),
  price numeric(10,2) not null,
  unique(service_id, vehicle_type_id)
);
-- Seed Matrix (Example: Package 2)
-- Assuming IDs: Sedan=1, Med=2, SUV=3, XL=4, Van=5; Package 2 = 3
-- You can run specific inserts if you know IDs, or use a function.
-- For now, user can populate via Admin UI or SQL.

create table if not exists public.inventory_items (
  id serial primary key,
  name text not null,
  price numeric(10,2) not null,
  stock_qty int default 0,
  category text check (category in ('Drinks', 'CarCare'))
);

create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  token_id int references public.tokens(id),
  vehicle_type_id int references public.vehicle_types(id), -- Nullable if customer doesn't know
  service_id int references public.services(id), -- Main service
  plate_number text,
  washer_name text, -- Nullable initially for Kiosk
  total_amount numeric(10,2) default 0,
  status text check (status in ('pending_verification', 'queued', 'completed', 'paid', 'cancelled')) default 'pending_verification',
  source text check (source in ('staff', 'kiosk')) default 'staff',
  is_verified boolean default true, -- Staff=true, Kiosk=false
  created_at timestamp with time zone default now()
);

create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id),
  item_type text check (item_type in ('service', 'inventory')),
  item_id int,
  item_name text, -- Snapshot for display
  price_snapshot numeric(10,2) not null,
  quantity int default 1
);

-- 3. Initial Tokens Seed (1-50)
do $$
begin
  for r in 1..50 loop
    insert into public.tokens (id, status) values (r, 'available')
    on conflict (id) do nothing;
  end loop;
end;
$$;
