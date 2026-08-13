-- Phase 4: Real-time expert chat + AI content screening
-- Chat: a session pairs one patient with one expert (responder/doctor).
-- Messages belong to a session. Real-time delivery happens via Socket.io;
-- these tables are the persistent record of that conversation.

CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_patient ON chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_expert ON chat_sessions(expert_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

-- AI screening result stored directly on posts — lets us see at a glance
-- what the AI classified a post as, separate from human-filed flags.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_classification VARCHAR(20);

-- AI-generated flags don't have a human flagger, so flagged_by must allow
-- NULL for those. A NULL flagged_by is how we distinguish "the AI screening
-- caught this" from "a specific user reported this."
ALTER TABLE flags ALTER COLUMN flagged_by DROP NOT NULL;
