-- Add customer_name to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add plate_number to orders table if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS plate_number TEXT;
