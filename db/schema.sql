-- AptitudeMaster 2.0 - Neon PostgreSQL Schema
-- Run this ONCE in your Neon console to set up all tables

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  identifier    TEXT UNIQUE NOT NULL,   -- email or username
  password_hash TEXT NOT NULL,           -- bcrypt hashed, never plain text
  target_exam   TEXT DEFAULT 'General Preparation',
  daily_goal    INTEGER DEFAULT 20,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);

-- =============================================
-- 2. PRACTICE ATTEMPTS
-- =============================================
CREATE TABLE IF NOT EXISTS practice_attempts (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id   INTEGER NOT NULL,
  correct       BOOLEAN NOT NULL,
  attempted_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, question_id)   -- one record per question per user, upserted
);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON practice_attempts(user_id);

-- =============================================
-- 3. BOOKMARKS
-- =============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- =============================================
-- 4. MISTAKES VAULT
-- =============================================
CREATE TABLE IF NOT EXISTS mistakes (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- =============================================
-- 5. TEST HISTORY
-- =============================================
CREATE TABLE IF NOT EXISTS test_history (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_name     TEXT NOT NULL,
  total        INTEGER NOT NULL,
  correct      INTEGER NOT NULL,
  score_pct    INTEGER NOT NULL,
  time_taken_s INTEGER DEFAULT 0,
  taken_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tests_user ON test_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_score ON test_history(score_pct DESC);

-- =============================================
-- 6. DAILY ACTIVITY (for streaks & heatmap)
-- =============================================
CREATE TABLE IF NOT EXISTS daily_activity (
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_answered INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

-- =============================================
-- 7. USER SESSIONS (optional JWT blacklist)
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Verify tables created
-- =============================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
