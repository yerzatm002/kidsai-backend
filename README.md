# KidsAI Backend

Backend API for KidsAI learning platform (topics, lessons, tasks, tests, achievements, AI helper, teacher module).

## Tech Stack

- Node.js + Express
- Prisma ORM (v7) + PostgreSQL (Neon)
- JWT Auth (access + refresh)
- Zod validation
- Supabase Storage (signed uploads)
- Google Gemini (Google AI Studio) via `@google/genai`
- express-rate-limit, helmet, cors, morgan

---

## Features

### Public / Student
- Topics & lessons (multi-language `kz` / `ru`)
- Tasks: attempts, server-side checking, XP
- Tests: attempts, auto-grading, best score tracking, XP
- Achievements/badges (auto-awarded)
- Dashboard/progress endpoints for student cabinet
- AI helper endpoint (safe, rate-limited)

### Teacher
- Content management (topics/lessons/tasks/tests/questions)
- Students monitoring (list + progress)
- Feedback review (optional)

---

## Project Structure
