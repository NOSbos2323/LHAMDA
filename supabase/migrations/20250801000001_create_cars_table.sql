CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price BIGINT NOT NULL,
  monthly_payment BIGINT NOT NULL,
  image TEXT NOT NULL,
  mileage INTEGER DEFAULT 0,
  transmission TEXT DEFAULT 'أوتوماتيك',
  fuel_type TEXT DEFAULT 'بنزين',
  color TEXT DEFAULT 'أبيض',
  location TEXT DEFAULT 'الجزائر',
  description TEXT,
  features TEXT[],
  specifications JSONB,
  financing_options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO cars (make, model, year, price, monthly_payment, image, mileage, transmission, fuel_type) VALUES
('تويوتا', 'كامري', 2024, 4200000, 58000, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('هوندا', 'أكورد', 2024, 3800000, 52000, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('نيسان', 'التيما', 2024, 3500000, 48000, 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('هيونداي', 'إلنترا', 2024, 3200000, 44000, 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('كيا', 'سيراتو', 2024, 2900000, 40000, 'https://images.unsplash.com/photo-1619767886558-efdc4e4c4c66?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('مرسيدس', 'C-Class', 2024, 8500000, 118000, 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('بي إم دبليو', '320i', 2024, 7800000, 108000, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('أودي', 'A4', 2024, 7200000, 100000, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فولكس واجن', 'جيتا', 2024, 3600000, 50000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('شيفروليه', 'كروز', 2024, 3100000, 43000, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فورد', 'فوكس', 2024, 2800000, 39000, 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('رينو', 'ميجان', 2024, 2600000, 36000, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80', 0, 'يدوي', 'بنزين'),
('بيجو', '308', 2024, 2700000, 37000, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('سيات', 'ليون', 2024, 3000000, 42000, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('سكودا', 'أوكتافيا', 2024, 3300000, 46000, 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('مازda', '6', 2024, 3700000, 51000, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('سوبارو', 'إمبريزا', 2024, 3400000, 47000, 'https://images.unsplash.com/photo-1606016159991-8b5d5f8e7e8e?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('ميتسوبيشي', 'لانسر', 2024, 2900000, 40000, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فيات', 'بونتو', 2024, 2800000, 38000, 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فيات', 'تيبو', 2024, 3200000, 44000, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فيات', '500', 2024, 2500000, 35000, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فيات', 'دوبلو', 2024, 3500000, 48000, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فيات', 'باندا', 2024, 2300000, 32000, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', 0, 'أوتوماتيك', 'بنزين'),
('فيات', 'كرومة', 2024, 4200000, 58000, 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80', 0, 'أوتوماتيك', 'بنزين');

INSERT INTO admin_users (email, password_hash, full_name) VALUES
('admin@autofinance.dz', '$2b$10$rOvHPxfxFqWgKeHnFBaK0eGYxry.oP2nxXBOf6wtwNiWS.TgdUW.C', 'مدير النظام');

alter publication supabase_realtime add table cars;
alter publication supabase_realtime add table admin_users;