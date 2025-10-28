DO $$ 
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name='users' AND column_name='password') THEN
        ALTER TABLE users RENAME COLUMN password TO password_hash;
    END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_ab_group ON users(ab_group);
CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep_sessions(user_id, sleep_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_date ON sleep_sessions(sleep_date DESC);

ALTER TABLE sleep_sessions ADD COLUMN IF NOT EXISTS sleep_duration INTEGER DEFAULT 0;