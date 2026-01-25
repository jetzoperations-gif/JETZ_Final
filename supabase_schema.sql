-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. DROP EVERYTHING (Clean Slate) to prevent conflicts
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.service_prices cascade;
drop table if exists public.services cascade;
drop table if exists public.vehicle_types cascade;
drop table if exists public.tokens cascade;
drop table if exists public.profiles cascade;

-- 3. Create tables

-- PROFILES (New: Role-Based Access)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text check (role in ('admin', 'staff')) default 'staff',
  created_at timestamp with time zone default now()
);

-- TOKENS
create table if not exists public.tokens (
  id serial primary key,
  status text check (status in ('available', 'active')) default 'available',
  current_job_id uuid
);

-- VEHICLE TYPES
create table if not exists public.vehicle_types (
  id serial primary key,
  name text not null unique,
  sort_order int default 0
);

-- SERVICES
create table if not exists public.services (
  id serial primary key,
  name text not null unique
);

-- SERVICE PRICES (Matrix)
create table if not exists public.service_prices (
  id serial primary key,
  service_id int references public.services(id),
  vehicle_type_id int references public.vehicle_types(id),
  price numeric(10,2) not null,
  unique(service_id, vehicle_type_id)
);

-- INVENTORY ITEMS
create table if not exists public.inventory_items (
  id serial primary key,
  name text not null,
  price numeric(10,2) not null,
  stock_qty int default 0,
  category text check (category in ('Drinks', 'Snacks', 'CarCare'))
);

-- ORDERS
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  token_id int references public.tokens(id),
  vehicle_type_id int references public.vehicle_types(id), -- Nullable initially
  service_id int references public.services(id), -- Main service
  plate_number text,
  washer_name text,
  total_amount numeric(10,2) default 0,
  status text check (status in ('pending_verification', 'queued', 'completed', 'paid', 'cancelled')) default 'pending_verification',
  source text check (source in ('staff', 'kiosk')) default 'staff',
  is_verified boolean default true,
  created_at timestamp with time zone default now()
);

-- ORDER ITEMS
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id),
  item_type text check (item_type in ('service', 'inventory')),
  item_id int,
  item_name text,
  price_snapshot numeric(10,2) not null,
  quantity int default 1
);

-- 4. SEED DATA

-- Seed tokens (1-50)
insert into public.tokens (id, status)
select generate_series(1, 50), 'available';

-- Seed vehicle types
insert into public.vehicle_types (name, sort_order) values
('Sedan', 1), ('Med', 2), ('SUV', 3), ('XL', 4), ('Van', 5);

-- Seed services
insert into public.services (name) values
('Basic carwash'), ('Wash n wax'), ('Package-1'), ('Package-2'),
('Package-3'), ('Body wash only'), ('Engine wash'), ('Vacuum only'),
('Under wash'), ('Wax only'), ('Dressing/Armor-all');

-- Seed Service Prices (Mapped from CSV)
-- Helper function to insert price easily would be nice, but raw SQL is safer for script
do $$
declare
  v_sedan int; v_med int; v_suv int; v_xl int; v_van int;
  s_basic int; s_wnw int; s_p1 int; s_p2 int; s_p3 int;
  s_body int; s_eng int; s_vac int; s_under int; s_wax int; s_dress int;
begin
  select id into v_sedan from vehicle_types where name='Sedan';
  select id into v_med from vehicle_types where name='Med';
  select id into v_suv from vehicle_types where name='SUV';
  select id into v_xl from vehicle_types where name='XL';
  select id into v_van from vehicle_types where name='Van';

  select id into s_basic from services where name='Basic carwash';
  select id into s_wnw from services where name='Wash n wax';
  select id into s_p1 from services where name='Package-1';
  select id into s_p2 from services where name='Package-2';
  select id into s_p3 from services where name='Package-3';
  select id into s_body from services where name='Body wash only';
  select id into s_eng from services where name='Engine wash';
  select id into s_vac from services where name='Vacuum only';
  select id into s_under from services where name='Under wash';
  select id into s_wax from services where name='Wax only';
  select id into s_dress from services where name='Dressing/Armor-all';

  -- Basic carwash: 170, 200, 230, 280, 330
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_basic, v_sedan, 170), (s_basic, v_med, 200), (s_basic, v_suv, 230), (s_basic, v_xl, 280), (s_basic, v_van, 330);

  -- Wash n wax: 380, 400, 450, 550, 600
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_wnw, v_sedan, 380), (s_wnw, v_med, 400), (s_wnw, v_suv, 450), (s_wnw, v_xl, 550), (s_wnw, v_van, 600);

  -- Package-1: 350, 430, 480, 550, 650
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_p1, v_sedan, 350), (s_p1, v_med, 430), (s_p1, v_suv, 480), (s_p1, v_xl, 550), (s_p1, v_van, 650);

  -- Package-2: 420, 450, 550, 680, 750
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_p2, v_sedan, 420), (s_p2, v_med, 450), (s_p2, v_suv, 550), (s_p2, v_xl, 680), (s_p2, v_van, 750);

  -- Package-3: 630, 680, 780, 880, 980
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_p3, v_sedan, 630), (s_p3, v_med, 680), (s_p3, v_suv, 780), (s_p3, v_xl, 880), (s_p3, v_van, 980);

  -- Body wash only: 130, 150, 180, 250, 300
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_body, v_sedan, 130), (s_body, v_med, 150), (s_body, v_suv, 180), (s_body, v_xl, 250), (s_body, v_van, 300);

  -- Engine wash: 100, 100, 100, 150, 150
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_eng, v_sedan, 100), (s_eng, v_med, 100), (s_eng, v_suv, 100), (s_eng, v_xl, 150), (s_eng, v_van, 150);

  -- Vacuum only: 100, 150, 150, 150, 300
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_vac, v_sedan, 100), (s_vac, v_med, 150), (s_vac, v_suv, 150), (s_vac, v_xl, 150), (s_vac, v_van, 300);

  -- Under wash: 200, 250, 280, 300, 200
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_under, v_sedan, 200), (s_under, v_med, 250), (s_under, v_suv, 280), (s_under, v_xl, 300), (s_under, v_van, 200);

  -- Wax only: 150, 200, 230, 250, 300
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_wax, v_sedan, 150), (s_wax, v_med, 200), (s_wax, v_suv, 230), (s_wax, v_xl, 250), (s_wax, v_van, 300);

  -- Dressing/Armor-all: 70, 70, 80, 80, 100
  insert into service_prices (service_id, vehicle_type_id, price) values
  (s_dress, v_sedan, 70), (s_dress, v_med, 70), (s_dress, v_suv, 80), (s_dress, v_xl, 80), (s_dress, v_van, 100);
end $$;

-- Seed Inventory
insert into public.inventory_items (name, price, category, stock_qty) values
('Softdrinks', 25.00, 'Drinks', 100),
('Water', 25.00, 'Drinks', 100),
('Snacks Lrg', 25.00, 'Snacks', 50),
('Snack Med', 20.00, 'Snacks', 50),
('Snack Sml', 15.00, 'Snacks', 50),
('Coffee Cups', 120.00, 'Drinks', 20),
('Plastic Cups', 120.00, 'Drinks', 20),
('VS1', 250.00, 'CarCare', 10),
('99 Pro WW', 250.00, 'CarCare', 10),
('Cabin Filter', 500.00, 'CarCare', 5),
('MXR-Horn', 1800.00, 'CarCare', 2),
('Break Cleaner', 300.00, 'CarCare', 5);
