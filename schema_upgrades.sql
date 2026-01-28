-- Create staff_profiles table
create table if not exists staff_profiles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null check (role in ('admin', 'cashier', 'greeter', 'barista')),
  pin_code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial staff data
insert into staff_profiles (name, role, pin_code)
values
  ('Admin User', 'admin', '9999'),
  ('Cashier Staff', 'cashier', '1234'),
  ('Greeter Staff', 'greeter', '1111'),
  ('Barista Staff', 'barista', '2222')
on conflict do nothing; -- Simplistic avoidance, though id is uuid so conflict unlikely unless we constrained name/role

-- Create expenses table
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  logged_by text -- Optional: to track who logged it (e.g. 'Cashier Staff')
);

-- Enable RLS (Optional for MVP but good practice)
alter table staff_profiles enable row level security;
alter table expenses enable row level security;

-- Policies (Open for MVP as per "current open access" context, but we can refine)
-- Allow read access to staff_profiles for PIN verification (or public for this MVP since we verify client-side or simple query)
create policy "Allow public read staff_profiles" on staff_profiles for select using (true);
create policy "Allow public read/insert expenses" on expenses for all using (true);
