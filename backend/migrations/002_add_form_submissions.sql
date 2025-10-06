CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  form_type VARCHAR(50) NOT NULL,
  form_title VARCHAR(200),
  google_form_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, form_type)
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON form_submissions(user_id);