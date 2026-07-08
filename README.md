# phtracker

Personal habit tracker with multi-user support and server sync.

## Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | React 19 + TanStack Start (SSR)             |
| Routing    | TanStack Router (file-based, `src/routes/`) |
| Build      | Vite 8 + Nitro (node-server)                |
| Styling    | Tailwind CSS 4                              |
| UI         | Radix primitives + shadcn-style components  |
| Auth       | Better Auth (SQLite)                        |
| Database   | PostgreSQL 17 + Drizzle ORM                 |
| Deployment | Docker Compose (VPS)                        |

## Prerequisites

- Node.js 22+
- Docker (for PostgreSQL)
- A VPS (for production deployment)

## Local Development

### 1. Set up environment

```sh
cp env.example .env
```

Edit `.env` — for local dev only `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are needed. `DATABASE_URL` is only required for sync to a local PostgreSQL.

### 2. Install dependencies

```sh
npm install
```

### 3. Start PostgreSQL (optional, for sync)

```sh
docker compose up -d db
```

This starts PostgreSQL on port 5432 with database `phtracker`, user `phtracker`, password `phtracker_dev`.

### 4. Generate and apply DB migrations

```sh
npm run db:generate   # reads schema → creates SQL in drizzle/
npm run db:migrate    # applies migrations to PostgreSQL
```

### 5. Start dev server

```sh
npm run dev
```

Opens at `http://localhost:8080` with HMR.

## Production Deployment

Deploy with Docker Compose. The `scripts/start.mjs` entry point automatically runs database migrations on every start before launching the server.

### 1. Clone on the VPS

```sh
git clone https://github.com/curioschurro99-dot/phtracker.git
cd phtracker
```

### 2. Configure environment

```sh
cp env.example .env.production
```

Edit `.env.production`:

| Variable             | Example                                           | Note                                      |
| -------------------- | ------------------------------------------------- | ----------------------------------------- |
| `BETTER_AUTH_SECRET` | `openssl rand -hex 32`                            | Generate a random 32-byte hex string      |
| `BETTER_AUTH_URL`    | `https://habit.yourdomain.com`                    | Must match your domain                    |
| `DATABASE_URL`       | `postgres://phtracker:password@db:5432/phtracker` | Host `db` matches the Docker service name |

### 3. Build and start

```sh
docker compose up -d --build
```

This:

- Builds the app image (client + SSR + Nitro server)
- Starts PostgreSQL
- Starts the app on port 3000
- Runs DB migrations automatically on container start

### 4. Behind a reverse proxy (recommended)

Add Caddy or nginx to `docker-compose.yml` for SSL termination:

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    depends_on:
      - app
```

Caddyfile:

```
habit.yourdomain.com {
    reverse_proxy app:3000
}
```

## Updating

```sh
git pull
docker compose up -d --build
```

That's it — migrations run automatically on next start.

## Architecture

- **Auth**: Better Auth with SQLite (stored in `data/auth.db`) — handles login, signup, session cookies.
- **Sync**: Full-state push/pull to PostgreSQL via Nitro routes at `/api/sync/load` and `/api/sync/save`.
- **Offline**: All state is also cached in localStorage. Server sync is best-effort — the app works without a database connection.
