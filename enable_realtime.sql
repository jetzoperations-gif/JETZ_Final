-- Enable replication for specific tables to support Realtime functionality

-- Add 'order_items' to the supabase_realtime publication
-- This is crucial for the Barista notification to fire when new items are added
alter publication supabase_realtime add table order_items;

-- Also ensure 'orders' is included if not already
alter publication supabase_realtime add table orders;

-- Check if they are added (Optional, for manual verification)
select * from pg_publication_tables where pubname = 'supabase_realtime';
