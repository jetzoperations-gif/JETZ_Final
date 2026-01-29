-- Create a simple settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- Seed defaults
INSERT INTO system_settings (key, value, description)
VALUES ('vip_threshold', '5', 'Number of visits to qualify as VIP')
ON CONFLICT (key) DO NOTHING;
