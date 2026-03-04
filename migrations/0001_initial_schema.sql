-- Hero Content Table
CREATE TABLE IF NOT EXISTS hero_content (
  id TEXT PRIMARY KEY,
  media_type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- News Table
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  thumbnail_url TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- About Story Table
CREATE TABLE IF NOT EXISTS about_story (
  id TEXT PRIMARY KEY,
  image_url TEXT,
  content TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hero_active ON hero_content(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_order ON brands("order");
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
CREATE INDEX IF NOT EXISTS idx_about_order ON about_story("order");
