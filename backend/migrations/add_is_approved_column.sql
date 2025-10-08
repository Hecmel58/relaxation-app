-- users tablosuna is_approved kolonu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Mevcut tüm kullanıcıları onayla (admin dahil)
UPDATE users SET is_approved = true WHERE is_approved IS NULL;

-- Admin kullanıcılar her zaman onaylı
UPDATE users SET is_approved = true WHERE is_admin = true;