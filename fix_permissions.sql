-- 1. Disable RLS on all tables (for MVP/Dev mode) to allow public read/write
alter table public.tokens disable row level security;
alter table public.vehicle_types disable row level security;
alter table public.services disable row level security;
alter table public.service_prices disable row level security;
alter table public.inventory_items disable row level security;
alter table public.orders disable row level security;
alter table public.order_items disable row level security;
alter table public.profiles disable row level security;

-- 2. Re-Seed Tokens (Run this just in case they are missing)
insert into public.tokens (id, status)
select generate_series(1, 50), 'available'
on conflict (id) do nothing;

-- 3. Verify Data
select count(*) as token_count from public.tokens;
