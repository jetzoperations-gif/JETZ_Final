ALTER TABLE public.orders 
ADD COLUMN customer_name text;

-- Optional: Add a comment
COMMENT ON COLUMN public.orders.customer_name IS 'Name of the customer for this order';
