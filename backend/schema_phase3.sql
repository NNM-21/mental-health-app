-- Phase 3: Self-Assessments, Score History, Resources
-- Two clinically validated screening tools: GAD7 (anxiety) and PHQ9 (depression).
-- Both are standard 0-3 scored questionnaires (0=Not at all, 1=Several days,
-- 2=More than half the days, 3=Nearly every day).

CREATE TYPE assessment_type AS ENUM ('GAD7', 'PHQ9');

CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  type assessment_type NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  questions JSONB NOT NULL   -- array of question strings, each scored 0-3
);

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL,    -- array of individual 0-3 answers, for review/audit
  taken_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL,       -- 'video' or 'article'
  url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,   -- e.g. 'anxiety', 'depression', 'sleep', 'general'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_assessment ON scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

-- Seed the two standard assessments (real, clinically validated question sets).
INSERT INTO assessments (type, title, questions) VALUES
('GAD7', 'GAD-7 Anxiety Screening', '[
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
]'::jsonb)
ON CONFLICT (type) DO NOTHING;

INSERT INTO assessments (type, title, questions) VALUES
('PHQ9', 'PHQ-9 Depression Screening', '[
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself, or that you are a failure",
  "Trouble concentrating on things, such as reading or watching TV",
  "Moving or speaking slowly, or being fidgety and restless",
  "Thoughts that you would be better off dead, or of hurting yourself"
]'::jsonb)
ON CONFLICT (type) DO NOTHING;

-- A few seed resources so the page has real content to show.
INSERT INTO resources (title, type, url, category) VALUES
('Understanding Anxiety: A Beginner''s Guide', 'article', 'https://www.nimh.nih.gov/health/topics/anxiety-disorders', 'anxiety'),
('5-Minute Breathing Exercise for Anxiety', 'video', 'https://www.youtube.com/watch?v=odADwWzHR24', 'anxiety'),
('What is Depression?', 'article', 'https://www.nimh.nih.gov/health/topics/depression', 'depression'),
('Sleep Hygiene Basics', 'article', 'https://www.sleepfoundation.org/sleep-hygiene', 'sleep');
