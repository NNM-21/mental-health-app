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

## Phase 2: Q&A Forum

Adds posts, responses, and flags — the 3-step content workflow:
responder drafts a response → moderator approves or rejects → published.

### New API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/posts` | Any logged-in user | Create a post |
| GET | `/api/posts` | Any logged-in user | List all posts with their approved responses |
| GET | `/api/posts/:id` | Any logged-in user | Get one post with approved responses |
| DELETE | `/api/posts/:id` | Owner, or moderator/admin | Delete a post |
| POST | `/api/posts/:postId/responses` | responder | Draft a response (starts as `draft`, hidden from patients) |
| GET | `/api/responses/pending` | moderator, admin | View the moderation queue |
| PATCH | `/api/responses/:id/approve` | moderator, admin | Approve a draft response → becomes visible |
| PATCH | `/api/responses/:id/reject` | moderator, admin | Reject a draft response → stays hidden |
| POST | `/api/posts/:postId/flags` | Any logged-in user | Flag a post as harmful |
| GET | `/api/flags/pending` | moderator, admin | View unreviewed flags |
| PATCH | `/api/flags/:id/review` | moderator, admin | Mark a flag reviewed; optionally delete the post |

### Example: full workflow

```bash
# 1. Patient creates a post
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <patient_token>" -H "Content-Type: application/json" \
  -d '{"title":"Feeling anxious lately","content":"..."}'

# 2. Responder drafts a response (starts hidden)
curl -X POST http://localhost:3000/api/posts/1/responses \
  -H "Authorization: Bearer <responder_token>" -H "Content-Type: application/json" \
  -d '{"content":"Have you tried grounding exercises?"}'

# 3. Moderator approves it — NOW it becomes visible
curl -X PATCH http://localhost:3000/api/responses/1/approve \
  -H "Authorization: Bearer <moderator_token>"

# 4. Anyone can flag a post
curl -X POST http://localhost:3000/api/posts/1/flags \
  -H "Authorization: Bearer <any_user_token>" -H "Content-Type: application/json" \
  -d '{"reason":"..."}'
```

### Architecture decisions (Phase 2)

- **Why does approval-gating happen in the query, not a separate "hidden" flag?**
  `getAllPosts`/`getPostById` only ever `SELECT ... WHERE r.status = 'approved'`
  for responses. A draft or rejected response is *never even fetched* for a
  patient's view — not hidden by the frontend, genuinely excluded at the
  database query level. This is more secure: there's no risk of accidentally
  exposing draft content because a UI check was missed somewhere.
- **Why is the ownership check for deleting a post in the controller, not middleware?**
  `requireRole()` can only check "what's your role" — it doesn't know about
  a specific post's owner. "Can this user delete THIS post" depends on data
  (`posts.user_id`), not just the role on their JWT, so that check happens
  after fetching the post inside the controller.
- **Why a separate `flags` table instead of just a boolean on `posts`?**
  A boolean would tell you a post *is* flagged, but not *who* flagged it,
  *why*, or *when* — and a post could be flagged by multiple people for
  different reasons. The `is_flagged` boolean on `posts` is a fast lookup
  for "should this show a warning in the UI", while `flags` is the full
  audit trail moderators actually review.

## Phase 3: Assessments, Score History, Resources

GAD7 (anxiety) and PHQ9 (depression) — real, clinically validated screening
questionnaires, each question scored 0-3. Score is the sum of all answers,
mapped to a standard severity band (minimal/mild/moderate/severe).

### New API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/assessments` | Any logged-in user | List GAD7/PHQ9 with their questions |
| POST | `/api/assessments/:type/submit` | Any logged-in user | Submit answers (`type` = GAD7 or PHQ9), get back score + severity |
| GET | `/api/scores/me` | Any logged-in user | Your own score history, oldest to newest |
| GET | `/api/analytics/scores` | doctor, admin | Aggregated scores (count/avg/min/max) — **no patient names or IDs, ever** |
| GET | `/api/resources` | Any logged-in user | List curated videos/articles (optional `?category=anxiety` filter) |
| POST | `/api/resources` | admin | Add a new resource |

### Example: submit an assessment

```bash
curl -X POST http://localhost:3000/api/assessments/GAD7/submit \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"answers":[2,2,1,2,1,1,2]}'
# -> {"score":11,"severity":"moderate", ...}
```

### Architecture decisions (Phase 3)

- **Why is scoring done server-side, not trusted from the client?**
  A malicious or buggy client could submit any total it wants. The server
  always recalculates the score itself from the raw 0-3 answers — the
  client's job is only to collect answers, never to decide the result.
- **Why store the raw `answers` array AND the computed `score`?**
  The score alone can't be re-derived or audited later — if a scoring bug
  is ever found, having the original answers means old submissions can be
  re-scored correctly instead of being permanently wrong.
- **Why does `getAnalytics` deliberately never JOIN to `users.name` or `users.email`?**
  This is the "privacy by design" principle from Section 3 of the project
  guide: a doctor's dashboard needs to see trends and volume, never who a
  specific score belongs to. The query is written so that's structurally
  impossible, not just a UI choice to hide a column.

**Honest simplification worth naming in an interview:** the project guide's
original design calls for a fully separate *analytics database* with zero
PII replicated into it — true physical isolation, so a breach of one
database can't expose the other. What's built here achieves the same
privacy *outcome* (no PII ever leaves the `getAnalytics` query) but within
a single database, which is a reasonable tradeoff for this stage — much
less deployment complexity, same practical guarantee for now. A production
version handling real patient data would go further and physically
separate the analytics database, likely with a scheduled anonymized sync
job feeding it. Naming this tradeoff, rather than pretending the simpler
version is the final architecture, is itself a good interview answer.

## API Documentation (Swagger)

Interactive, always-in-sync API docs generated from JSDoc comments above each
route. Once the server is running, open:

```
http://localhost:3000/api-docs        (local)
https://mental-health-app-1-a5qo.onrender.com/api-docs   (live)
```

This shows every endpoint across all three phases (18 total), grouped by tag
(Auth, Forum, Wellness), with a "Try it out" button that lets you send real
requests directly from the browser — no Postman needed for quick checks.

**Why generate docs from code comments instead of a separate document?**
A standalone docs file drifts out of sync the moment a route changes and
nobody remembers to update it. JSDoc comments live directly above the route
they describe, in the same file — when the route changes, the doc comment
is right there to update in the same diff.

## What's next (Phase 4)
Real-time expert chat (Socket.io) and AI-powered content screening
(Anthropic API) for the forum.
