# MindSpace — Backend (Phase 1: Auth + Roles)

Self-help mental health platform. Phase 1 covers user registration, login,
JWT authentication, and role-based access control (RBAC) for 5 user roles:
`patient`, `responder`, `moderator`, `doctor`, `admin`.

## Stack
Node.js · Express · PostgreSQL · JWT · bcrypt

## Setup

1. **Install PostgreSQL** if you don't already have it, then create the database:
   ```bash
   psql -U postgres
   CREATE USER mindspace_user WITH PASSWORD 'your_password_here';
   CREATE DATABASE mindspace_db OWNER mindspace_user;
   \q
   ```

2. **Apply the schema:**
   ```bash
   psql -U mindspace_user -d mindspace_db -f schema.sql
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your real DB password and a random JWT secret.
   Generate a secret with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Run the server:**
   ```bash
   npm start
   ```
   You should see:
   ```
   MindSpace backend running on http://localhost:3000
   Database connected successfully.
   ```

## API Endpoints (Phase 1)

| Method | Route | Auth required | Description |
|--------|-------|----------------|-------------|
| GET | `/health` | No | Confirms the server is running |
| POST | `/api/auth/register` | No | Create a new user account |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes (any role) | Returns the logged-in user's id + role |
| GET | `/api/auth/admin-only` | Yes (admin only) | Example RBAC-protected route |

### Example: Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"securepass123","role":"patient"}'
```

### Example: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"securepass123"}'
```

### Example: Protected route
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

## Architecture decisions (Phase 1)

- **Why JWT?** Stateless auth — the server doesn't need to remember who's
  logged in between requests. The token itself carries the user's id and
  role, signed so it can't be tampered with.
- **Why bcrypt?** Passwords are never stored as plain text. bcrypt hashes
  them with a salt, so even if the database were breached, passwords
  aren't directly readable.
- **Why middleware for RBAC?** `authenticate` and `requireRole` run
  *before* the route handler. This keeps permission logic out of the
  business logic — a route just declares which roles can access it.
- **Why a connection pool for PostgreSQL?** The API handles many
  concurrent requests. A pool reuses a set of open connections instead of
  opening/closing one per request, which is much faster.

## What's next (Phase 2)
Q&A forum: post CRUD, flag system, moderation workflow (draft → moderator
approves → published), and the React frontend.
