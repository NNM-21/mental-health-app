-- Phase 1: Users table with role-based access control
-- Roles: patient, responder, moderator, doctor, admin

CREATE TYPE user_role AS ENUM ('patient', 'responder', 'moderator', 'doctor', 'admin');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index on email since we look users up by it on every login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
