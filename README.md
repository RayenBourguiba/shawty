# 🔗 URL Shortener

A full-stack URL shortener built with **NestJS**, **Next.js**, **Prisma**, **PostgreSQL**, **Docker**, and **TypeScript**. Submit a long URL, get a short one — with visit tracking, analytics, and a clean web interface.

---

## Features

- **Shorten URLs** — Submit any valid HTTP/HTTPS URL and receive a unique short code
- **Instant redirects** — Short URLs resolve and redirect to their original destination
- **Visit analytics** — Each redirect increments a visit counter and records the last visited timestamp
- **URL listing** — Browse all shortened URLs with their short codes, visit counts, and creation dates
- **Detail pages** — View full analytics for any individual shortened URL
- **Duplicate detection** — Re-submitting an existing URL returns the existing record instead of creating a duplicate
- **Rate limiting** — Protects the shortening endpoint from automated abuse
- **Comprehensive tests** — Backend unit tests, backend integration tests, and frontend component tests

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Infrastructure | Docker, Docker Compose |
| Testing | Jest, Supertest, React Testing Library |

---

## Getting Started

### Option 1 — Docker (Recommended)

The easiest way to run the full stack locally. From the project root:

```bash
docker-compose up --build
```

This starts three services: the PostgreSQL database, the NestJS backend, and the Next.js frontend.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |

---

### Option 2 — Manual Setup

**Prerequisites:** Node.js and a running PostgreSQL instance.

**1. Install dependencies**

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

**2. Configure environment variables**

Create `backend/.env` with the following:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/url_shortener?schema=public"
PORT=3001
BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**3. Run database migrations**

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

**4. Start the services**

```bash
# Backend (from /backend)
npm run start:dev

# Frontend (from /frontend)
npm run dev
```

---

## Running Tests

**Locally:**

```bash
# Backend unit tests
cd backend && npm run test

# Backend integration tests
cd backend && npm run test:e2e

# Frontend component tests
cd frontend && npm run test
```

**Inside Docker containers:**

```bash
docker-compose exec backend npm run test
docker-compose exec backend npm run test:e2e
docker-compose exec frontend npm run test
```

---

## API Reference

### `POST /api/urls`
Create a shortened URL.

**Request body:**
```json
{ "url": "https://example.com/some/long/path" }
```

**Response:**
```json
{
  "id": "...",
  "originalUrl": "https://example.com/some/long/path",
  "shortCode": "Ab3xYz1",
  "visitCount": 0,
  "createdAt": "...",
  "updatedAt": "...",
  "lastVisitedAt": null,
  "shortUrl": "http://localhost:3001/Ab3xYz1"
}
```

### `GET /api/urls`
Returns all shortened URLs, ordered by most recently created.

### `GET /api/urls/:shortCode`
Returns details for a specific shortened URL.

### `GET /:shortCode`
Redirects to the original URL and increments the visit counter.

---

## Project Structure

```
.
├── backend/          # NestJS application, Prisma schema, migrations, and tests
├── frontend/         # Next.js application, React components, pages, and tests
└── docker-compose.yml
```

---

## How It Works

1. A user submits a long URL via the frontend form
2. The backend validates the URL and checks for an existing record
3. If new, a unique 7-character Base62 short code is generated and stored in PostgreSQL
4. The frontend displays the resulting short URL
5. When a visitor accesses the short URL, the backend resolves it, updates analytics, and issues an HTTP redirect

### Short Code Generation

Short codes are generated using random Base62 characters (digits + lowercase + uppercase), giving over 3.5 trillion possible combinations at 7 characters. PostgreSQL enforces a unique constraint on the `shortCode` field; the rare collision is handled with an automatic retry.

---

## Design Decisions & Tradeoffs

**Random Base62 vs. deterministic encoding** — Random generation is simpler and collision-safe at this scale. A production system at high write volume would benefit from deterministic Base62 encoding of globally unique numeric IDs to eliminate retry logic entirely.

**Summary analytics on the main table** — Storing `visitCount` and `lastVisitedAt` directly on the `ShortUrl` record keeps reads simple and the schema flat. A production system tracking per-click events would move this to a separate `visits` table or an async event pipeline.

**Direct PostgreSQL reads for redirects** — Acceptable at this scale. Under heavier traffic, a Redis cache layer in front of the database would dramatically reduce latency and load for popular short links.

---

## Scaling Considerations

A URL shortener's read-to-write ratio is heavily skewed toward reads, so the redirect path is the most critical to optimize.

- **Caching** — A Redis cache (e.g., Amazon ElastiCache) in front of PostgreSQL makes popular redirects near-instant
- **Short code generation at scale** — Deterministic Base62 encoding of unique IDs avoids retries under high write concurrency
- **Database scaling** — PostgreSQL read replicas for listing/analytics queries; write traffic stays on the primary
- **Async analytics** — Decoupling visit tracking from the redirect path (via a queue) keeps redirects fast under load
- **Abuse prevention** — Rate limiting, URL scheme validation, and WAF rules protect public-facing endpoints

---

## AWS Deployment Path

For production deployment, a solid architecture would include:

| Component | AWS Service |
|---|---|
| Containers | Amazon ECS (Fargate) |
| Database | Amazon RDS (PostgreSQL, Multi-AZ) |
| Cache | Amazon ElastiCache (Redis) |
| Load balancing | Application Load Balancer |
| Secrets | AWS Secrets Manager |
| DNS | Amazon Route 53 |
| Security | AWS WAF |
| Observability | Amazon CloudWatch |

---

## Possible Future Improvements

- **Custom aliases** — Let users choose their own short code
- **Link expiration** — Automatically invalidate links after a configurable time period
- **QR code generation** — One-click QR codes for offline sharing
- **Authentication** — User accounts with ownership and management of personal links
- **Richer analytics** — Daily click history, referrer tracking, browser and geographic data
- **Redis caching** — Sub-millisecond redirect resolution for popular links
- **Async visit processing** — Decouple analytics writes from the hot redirect path
