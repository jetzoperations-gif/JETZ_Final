-- Create Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'washer', -- 'washer', 'manager', etc.
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Commission Column to Orders (to lock in the value at payment)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0;

-- Optional: Link washer_id if we want strict foreign keys later, 
-- but for now sticking to washer_name text for leaderboard compatibility
-- or we can ensure washer_name is populated from staff.name.

-- Seed initial data
INSERT INTO staff (name, role) VALUES 
('Juan Dela Cruz', 'washer'),
('Pedro Penduko', 'washer'),
('Maria Clara', 'washer')
ON CONFLICT DO NOTHING;
