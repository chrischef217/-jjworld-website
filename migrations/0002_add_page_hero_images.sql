-- Page Hero Images Table
CREATE TABLE IF NOT EXISTS page_hero_images (
  id TEXT PRIMARY KEY,
  page_name TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default hero images for each page
INSERT OR IGNORE INTO page_hero_images (id, page_name, image_url, title, subtitle) VALUES
('about-hero', 'about', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1920', 'ABOUT US', 'JJ WORLD를 소개합니다'),
('brands-hero', 'brands', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920', 'BRANDS', '프리미엄 뷰티 브랜드'),
('pr-hero', 'pr', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920', 'NEWS & PR', '최신 소식과 보도자료'),
('contact-hero', 'contact', 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920', 'BUSINESS CONTACT', '비즈니스 문의'),
('faq-hero', 'faq', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920', 'FAQ', '자주 묻는 질문');

CREATE INDEX IF NOT EXISTS idx_page_hero_page_name ON page_hero_images(page_name);
