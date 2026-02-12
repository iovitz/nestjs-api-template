# External Integrations

**Analysis Date:** 2026-02-12

## APIs & External Services

**HTTP Client (for external API calls):**
- @nestjs/axios 4.0.1 - Built on axios
- Used in feature modules for external HTTP requests

## Data Storage

**Databases:**
- PostgreSQL 13+
  - Connection: `POSTGRE_HOST`, `POSTGRE_PORT`, `POSTGRE_USER`, `POSTGRE_PASSWORD`, `POSTGRE_NAME`
  - Driver: `@mikro-orm/postgresql` 6.6.4
  - ORM: MikroORM 6.6.4
  - Connection pool managed by MikroORM

**File Storage:**
- Local filesystem only
- No external cloud storage integration detected

**Caching:**
- Redis 6+
  - Host: `REDIS_HOST`
  - Port: `REDIS_PORT`
  - Password: `REDIS_PASSWORD` (optional)
  - Database: `REDIS_DB` (default: 10)
  - Key prefix: `REDIS_KEY_PREFIX`
  - Client: `ioredis` 5.9.1
  - Used for sessions and caching

## Authentication & Identity

**Auth Provider:**
- Custom session-based authentication
  - Implementation: Redis-backed sessions
  - Cookie-based session storage via `@fastify/cookie`
  - Cookie secret: `COOKIE_SECRET`

**Password Hashing:**
- argon2 0.44.0
  - Used in `CryptoService` (`src/global/crypto/crypto.service.ts`)

**Encryption:**
- ECIES (Elliptic Curve Integrated Encryption Scheme)
  - Curve: secp256k1
  - Private key: `ECIES_PRIVATE_KEY` (env var)
  - Public key: `ECIES_PUBLIC_KEY` (env var)
  - Implementation: `eciesjs` 0.4.17
  - Used in `CryptoService` (`src/global/crypto/crypto.service.ts`)

**Distributed ID Generation:**
- Snowflake algorithm
  - Implementation: `@sapphire/snowflake` 3.5.5
  - Service: `IdService` (`src/global/id/id.service.ts`)
  - Epoch: `SNOWFLAKE_EPOCH` (default: 2025-01-01T00:00:00.000Z)

## Monitoring & Observability

**Error Tracking:**
- Not detected - Custom error handling via filter chain

**Logs:**
- pino 10.2.0 - JSON-structured logging
- pino-pretty 13.1.3 - Development pretty-printing
- Integration: nestjs-pino 4.5.0
- Log level: `LOG_LEVEL` env var

**Health Checks:**
- @nestjs/terminus 11.0.0
  - Configured in health module (`src/features/health/`)

## CI/CD & Deployment

**Hosting:**
- Node.js application
- PM2 support via `ecosystem.config.js`

**CI Pipeline:**
- Not explicitly configured
- Commit linting: commitlint with conventional-changelog
- Git hooks: husky

## Environment Configuration

**Required env vars:**
```bash
# App
NODE_ENV=development|production
APP_PORT=9876
APP_HOST=0.0.0.0
COOKIE_SECRET=<secure-random-string>

# Database
POSTGRE_HOST=127.0.0.1
POSTGRE_PORT=5432
POSTGRE_USER=nest_user
POSTGRE_NAME=nest
POSTGRE_PASSWORD=<password>

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=10
REDIS_PASSWORD=<optional>
REDIS_KEY_PREFIX=<optional>
REDIS_ENABLE_OFFLINE_QUEUE=true
REDIS_MAX_RETRIES_PER_REQUEST=3

# Snowflake
SNOWFLAKE_EPOCH=2025-01-01T00:00:00.000Z

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=60
SHORT_THROTTLE_TTL=10000
SHORT_THROTTLE_LIMIT=20

# Logging
LOG_LEVEL=trace

# ECIES Encryption
ECIES_PRIVATE_KEY=<hex-private-key>
ECIES_PUBLIC_KEY=<hex-public-key>
```

**Secrets location:**
- `.env` file (gitignored)
- `.env.sample` (template without secrets)
- No secret manager integration detected

## Webhooks & Callbacks

**Incoming:**
- Not detected - API is internal

**Outgoing:**
- HTTP requests via @nestjs/axios for external service calls
- Configurable per feature module

## Database Migrations & Seeding

**Migration Framework:**
- MikroORM Migrations
  - Path: `src/global/db/migrations/`
  - Table: `mikro_orm_migrations`
  - Commands: `migration:create`, `migration:up`, `migration:down`, `migration:fresh`

**Seeder Framework:**
- MikroORM Seeders
  - Path: `src/global/db/seeders/`
  - Default seeder: `DatabaseSeeder`
  - Custom seeders: `UserSeeder`

## Scheduled Tasks

**Cron Jobs:**
- @nestjs/schedule 6.1.0
- Implementation: `CronjobService` (`src/global/cronjob/cronjob.service.ts`)

---

*Integration audit: 2026-02-12*
