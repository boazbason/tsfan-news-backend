# Safed News - Full Backend (PostgreSQL + Prisma)

## Overview
This scaffold provides a production-capable backend using Express, TypeScript and Prisma (Postgres).
Features included:
- Users (register/login) with bcrypt + JWT and roles (user, editor, admin)
- Posts with categories, featured flag, images (uploads), view count
- Comments (with moderation)
- Ads management (placements, active dates)
- Newsletter subscribers
- Admin area protected by role middleware
- Prisma schema + seed script
- Docker Compose for Postgres (optional)

## Quick start (local)
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and adjust DATABASE_URL
3. Run Prisma migrate & generate: `npx prisma generate && npx prisma migrate dev --name init`
4. Seed sample data: `npm run seed`
5. Start dev server: `npm run dev`

## Docker (optional)
There's a `docker-compose.yml` that starts Postgres. Use it if you don't have Postgres locally.
