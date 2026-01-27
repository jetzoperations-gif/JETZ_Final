-- Add customer_name to orders table to track who the order belongs to
ALTER TABLE orders 
ADD COLUMN customer_name TEXT;

-- For good measure, let's also add plate_number if it's separate from customer_name
ALTER TABLE orders
ADD COLUMN plate_number TEXT;
