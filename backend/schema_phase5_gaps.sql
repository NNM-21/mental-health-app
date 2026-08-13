-- Emergency contacts: always publicly visible, no login required.
-- This is deliberately separate from the expert chat (Phase 4) — a crisis
-- helpline needs to be reachable in one click, with zero friction, not
-- gated behind matching with an available expert.

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  description TEXT,
  hours VARCHAR(100),
  region VARCHAR(50) DEFAULT 'India',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Real, current Indian national mental health helplines (verified).
INSERT INTO emergency_contacts (name, phone, description, hours, region) VALUES
('Tele MANAS', '14416', 'National mental health helpline, Ministry of Health and Family Welfare. Also reachable at 1-800-891-4416.', '24x7', 'India'),
('KIRAN', '1800-599-0019', 'National mental health rehabilitation helpline, Ministry of Social Justice and Empowerment. Available in 13 languages.', '24x7', 'India'),
('iCall', '9152987821', 'Psychosocial helpline run by the Tata Institute of Social Sciences (TISS).', '10am-8pm, Mon-Sat', 'India');
