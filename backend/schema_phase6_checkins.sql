-- Phase 6: AI Wellness Check-In
-- A free-text journal entry. Gemini classifies it (safe/crisis) and, if
-- safe, writes a short bounded reflection back to the user. Crisis entries
-- do NOT get the AI's own text shown to the user — they get a fixed safety
-- message instead, and the entry is surfaced to moderators for follow-up,
-- the same way AI-flagged forum posts are (see schema_phase4.sql).
--
-- This is a separate table from `flags` rather than reusing it directly,
-- because flags.post_id is a NOT NULL foreign key to posts — a check-in
-- isn't a post. `reviewed` plays the same role here that it does on flags.

CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_reflection TEXT,
  ai_classification VARCHAR(20), -- 'safe' | 'crisis' | NULL (classification failed)
  reviewed BOOLEAN DEFAULT FALSE, -- only meaningful for crisis/unclassified entries
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_pending_review
  ON checkins(reviewed)
  WHERE reviewed = FALSE;
