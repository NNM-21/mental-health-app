-- Phase 2: Q&A Forum
-- Posts: patients ask questions. Visible immediately, but can be flagged.
-- Responses: responders draft answers. Must be approved by a moderator before
--            they're visible to anyone else — this is the 3-step workflow:
--            draft -> moderator approves -> published.
-- Flags: any authenticated user can flag a post as harmful. Moderators review the queue.

CREATE TYPE response_status AS ENUM ('draft', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  responder_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status response_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  flagged_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_post ON responses(post_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON responses(status);
CREATE INDEX IF NOT EXISTS idx_flags_reviewed ON flags(reviewed);
