-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ab_group TEXT DEFAULT 'control' CHECK (ab_group IN ('control', 'experiment')),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Uyku takibi tablosu
CREATE TABLE IF NOT EXISTS sleep_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  bedtime DATETIME,
  sleep_time DATETIME,
  wake_time DATETIME,
  total_sleep_minutes INTEGER,
  rem_duration INTEGER DEFAULT 0,
  deep_sleep_duration INTEGER DEFAULT 0,
  light_sleep_duration INTEGER DEFAULT 0,
  awake_duration INTEGER DEFAULT 0,
  sleep_quality REAL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  sleep_efficiency REAL,
  notes TEXT,
  mood_before_sleep INTEGER CHECK (mood_before_sleep >= 1 AND mood_before_sleep <= 5),
  mood_after_sleep INTEGER CHECK (mood_after_sleep >= 1 AND mood_after_sleep <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- A/B Test olayları
CREATE TABLE IF NOT EXISTS ab_test_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_duration INTEGER,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rahatlama içerikleri
CREATE TABLE IF NOT EXISTS relaxation_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'nature_sound')),
  url TEXT NOT NULL,
  duration INTEGER,
  category TEXT NOT NULL,
  subcategory TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Binaural sesler
CREATE TABLE IF NOT EXISTS binaural_sounds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_frequency REAL NOT NULL,
  binaural_frequency REAL NOT NULL,
  duration INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  brainwave_type TEXT,
  url TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  play_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Binaural sessions
CREATE TABLE IF NOT EXISTS binaural_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  binaural_content_id TEXT NOT NULL,
  session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_end DATETIME,
  duration_listened_minutes INTEGER,
  completion_percentage INTEGER,
  volume_level INTEGER,
  mood_before INTEGER,
  mood_after INTEGER,
  relaxation_level INTEGER,
  sleep_effect INTEGER,
  session_notes TEXT,
  device_type TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (binaural_content_id) REFERENCES binaural_sounds(id)
);

-- Kullanıcı içerik etkileşimleri
CREATE TABLE IF NOT EXISTS user_content_interactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('relaxation', 'binaural')),
  content_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'complete', 'skip')),
  duration_seconds INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  form_type TEXT NOT NULL,
  google_form_id TEXT,
  form_title TEXT,
  submission_data TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_by TEXT,
  reviewed_at DATETIME,
  expert_notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Kullanıcı tercihleri
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_sleep_reminder BOOLEAN DEFAULT TRUE,
  notification_chat_messages BOOLEAN DEFAULT TRUE,
  preferred_sleep_duration INTEGER DEFAULT 480,
  preferred_bedtime TIME DEFAULT '22:00',
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'tr',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_ab_group ON users(ab_group);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_date ON sleep_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user ON ab_test_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_binaural_sessions_user ON binaural_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON form_submissions(user_id);