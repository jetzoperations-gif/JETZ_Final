-- Fix for "violates check constraint" error
-- We need to allow 'ready' and 'working' status in the database

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('queued', 'washing', 'working', 'drying', 'detailing', 'ready', 'completed', 'paid', 'cancelled'));
