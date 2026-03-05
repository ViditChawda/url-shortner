<img width="1088" height="650" alt="image" src="https://github.com/user-attachments/assets/ae167810-d116-49e2-87b7-fd84bcab2973" />
# URL Shortener

A full-stack URL shortener built with Next.js. Paste a long URL, get a short link, and share it. Visits use Redis for fast redirects with PostgreSQL as the primary database.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Upstash Redis (REST API)

## Features

- Shorten long URLs to compact links (Base62 encoding)
- Redirect via clean URLs: `yoursite.com/abc123` → original URL
- Redis caching for fast redirect resolution (1-hour TTL)
- Usage tracking (click count per short link)
- Simple UI to create and copy short URLs

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Upstash Redis account (free tier available at [upstash.com](https://upstash.com))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd url-shortener-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
BASE_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BASE_URL` | Base URL for generated short links (e.g. `https://short.ly`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### Database Setup

```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev
```

### Run the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Shortening

1. User submits a long URL via the form.
2. Server creates a database record and assigns a Base62 short code (e.g. `abc123`).
3. Returns a short URL: `{BASE_URL}/{shortCode}`.

### Redirect (Cache-First)

1. User visits `/{shortCode}` or `/api/redirect?code={shortCode}`.
2. **Redis** is checked first — if cached, redirect immediately.
3. If not in cache, **PostgreSQL** is queried.
4. Result is cached in Redis (1-hour TTL) for future requests.
5. Redirect (307) to the original URL.

## Project Structure

```
├── app/
│   ├── [shortCode]/route.ts   # Pretty redirect: /abc123 → long URL
│   ├── api/
│   │   ├── shorten/route.ts   # POST - create short link
│   │   ├── redirect/route.ts  # GET ?code=... - redirect
│   │   └── test-redis/route.ts
│   ├── page.tsx               # Home page (shorten form)
│   └── layout.tsx
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── redis.ts               # Upstash Redis client
│   ├── redirectService.ts     # Resolve short code (cache + DB)
│   └── shortCode.ts           # Base62 encoding
└── prisma/
    └── schema.prisma          # Url model
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Create a short link. Body: `{ "longUrl": "https://..." }` |
| GET | `/{shortCode}` | Redirect to the original URL |
| GET | `/api/redirect?code={shortCode}` | Same redirect via query param |
| GET | `/api/test-redis` | Health check for Redis connection |

## License

MIT
