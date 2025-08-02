CREATE TABLE IF NOT EXISTS telecom_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO telecom_links (name, url) VALUES
('Azra', 'https://azra.dz'),
('Mobilis', 'https://mobilis.dz'),
('Djezzy', 'https://djezzy.dz'),
('Ooredoo', 'https://ooredoo.dz')
ON CONFLICT DO NOTHING;

alter publication supabase_realtime add table telecom_links;
