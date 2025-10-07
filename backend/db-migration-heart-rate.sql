-- Kalp atım hızı oturumları tablosu
CREATE TABLE IF NOT EXISTS heart_rate_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(100) NOT NULL,
  content_name VARCHAR(255) NOT NULL,
  heart_rate_before INTEGER NOT NULL,
  heart_rate_after INTEGER NOT NULL,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heart_rate_user ON heart_rate_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_rate_created ON heart_rate_sessions(created_at);