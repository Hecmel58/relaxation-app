-- ✅ Push token kolonları ekle (zaten varsa hata vermez)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMP;

-- ✅ Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token);

COMMENT ON COLUMN users.push_token IS 'Expo Push Token for mobile notifications';
COMMENT ON COLUMN users.push_token_updated_at IS 'Last update time for push token';