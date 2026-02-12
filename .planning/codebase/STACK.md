# Technology Stack

**Analysis Date:** 2026-02-12

## Languages

**Primary:**
- TypeScript 5.9.3 - Core application language
- Node.js 22.0.0+ - Runtime environment

**Secondary:**
- JavaScript - Build tooling and migrations

## Runtime

**Environment:**
- Node.js 22.0.0+ (engineStrict enforced)
- Platform: macOS (Darwin) / Linux

**Package Manager:**
- pnpm 10.0.0+
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- NestJS 11.1.11 - Application framework with dependency injection
- Fastify 5.6.2 - Web framework adapter for NestJS (via `@nestjs/platform-fastify`)

**Testing:**
- Jest 30.2.0 - Test runner
- ts-jest 29.4.6 - TypeScript transformer for Jest
- @nestjs/testing 11.1.11 - Testing utilities for NestJS
- supertest 7.2.2 - HTTP integration testing

**Build/Dev:**
- @nestjs/cli 11.0.14 - Build tool and scaffolding
- ts-loader 9.5.4 - TypeScript loader for webpack
- ts-node 10.9.2 - TypeScript execution engine
- tsconfig-paths 4.2.0 - Module path resolution

**Code Quality:**
- oxlint 1.39.0 - Linter
- oxfmt 0.24.0 - Formatter

## Key Dependencies

**Database:**
- @mikro-orm/core 6.6.4 - ORM
- @mikro-orm/nestjs 6.1.1 - NestJS integration
- @mikro-orm/postgresql 6.6.4 - PostgreSQL driver

**Caching & Sessions:**
- ioredis 5.9.1 - Redis client
- @fastify/cookie 11.0.2 - Cookie handling for sessions

**Configuration:**
- @nestjs/config 4.0.2 - Environment configuration
- dotenv 17.2.3 - Environment variable loading
- dotenv-cli 11.0.0 - CLI with dotenv support

**Validation & Serialization:**
- class-validator 0.14.3 - DTO validation
- class-transformer 0.5.1 - DTO transformation

**Authentication & Security:**
- argon2 0.44.0 - Password hashing
- eciesjs 0.4.17 - ECIES encryption (secp256k1)

**HTTP Client:**
- @nestjs/axios 4.0.1 - HTTP client for external API calls

**Scheduling:**
- @nestjs/schedule 6.1.0 - Cron job support

**Logging:**
- pino 10.2.0 - JSON logger
- pino-http 11.0.0 - HTTP request logging
- pino-pretty 13.1.3 - Pretty printing for logs
- nestjs-pino 4.5.0 - NestJS integration

**Utilities:**
- es-toolkit 1.43.0 - Modern utility library
- @sapphire/snowflake 3.5.5 - Distributed ID generation
- reflect-metadata 0.2.2 - Decorator metadata

**Health Checks:**
- @nestjs/terminus 11.0.0 - Health checks module

**Rate Limiting:**
- @nestjs/throttler 6.5.0 - Rate limiting

## Configuration

**Environment:**
- Configuration via `ConfigService`
- Required env vars documented in `.env.sample`

**Build:**
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS CLI configuration (implicit via @nestjs/cli)

**Key tsconfig settings:**
```json
{
  "target": "ES2023",
  "module": "nodenext",
  "moduleResolution": "nodenext",
  "strictNullChecks": true,
  "declaration": true,
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

**Jest Configuration:**
- Root dir: `src`
- Transform: `ts-jest`
- Test regex: `.*\.spec\.ts$`
- Path alias: `^src/(.*)$` -> `<rootDir>/$1`

## Platform Requirements

**Development:**
- Node.js 22.0.0+
- pnpm 10.0.0+
- PostgreSQL database
- Redis server

**Production:**
- Node.js 22.0.0+
- PostgreSQL database
- Redis server
- Process manager (e.g., PM2 via `ecosystem.config.js`)

## Build Artifacts

- Output directory: `dist/`
- Compiled JavaScript with source maps
- Entity files compiled to `dist/**/entities/*.entity.js`
- Migrations compiled to `dist/global/db/migrations/`
- Seeders compiled to `dist/global/db/seeders/`

---

*Stack analysis: 2026-02-12*
