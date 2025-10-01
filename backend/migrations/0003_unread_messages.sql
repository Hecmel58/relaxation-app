-- Okunmamış mesaj sayacı tablosu
CREATE TABLE IF NOT EXISTS unread_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, sender_id)
);

CREATE INDEX IF NOT EXISTS idx_unread_user ON unread_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_unread_sender ON unread_messages(sender_id);