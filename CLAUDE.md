# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS 11.x backend API template with MikroORM 6.x (PostgreSQL), Redis, and Fastify. Modular architecture with comprehensive error handling, logging, and testing patterns.

## Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Build with SWC
pnpm start:prod       # Run production build

# Testing
pnpm test             # Unit tests (Jest)
pnpm test:e2e         # E2E tests
pnpm test:cov         # With coverage

# Code Quality
pnpm lint             # oxlint check
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Auto-format with oxfmt
```

## Architecture

- `src/app.module.ts` - Root module with global providers (interceptors, filters, guards, pipes)
- `src/features/` - Feature modules (user, health, etc.) following domain-driven design
- `src/global/` - Global module with cross-cutting concerns:
  - `db/` - Database configuration and entities
  - `redis/` - Redis configuration
  - `id/` - Snowflake ID generation service
  - `http-context/` - HTTP context service (cookies, session)
  - `cronjob/` - Scheduled tasks
- `src/aspects/` - Cross-cutting concerns:
  - `decorators/` - Custom decorators (`@CurrentUser`, `@ClientIP`)
  - `filters/` - Exception filters (validation, HTTP, default)
  - `guards/` - Auth guards, throttler guard
  - `interceptors/` - Response formatter

## Key Patterns

**Request Flow**: ThrottlerGuard → Interceptors → Controllers → Services → FormatterInterceptor (response)

**Entities**: All must extend `EntityBase` (id, createdAt, updatedAt). Located in `src/global/db/entities/`. Use `IdService.genPrimaryKey()` for primary keys. No data migrations.

**Imports**: Use absolute paths with `src/` prefix (e.g., `import { User } from "src/global/db/entities/user.entity"`)

**Testing**: Unit tests alongside services (`*.spec.ts`). E2E tests in `test/` directory (`*.e2e-spec.ts`)

## Conventions

- Logger: Each class creates private Logger instance; never log passwords
- Versioning: Exact versions only (no `^`, `~`, `*`, `latest`)
- Formatting: 2 spaces, 120 char line limit, semicolons required
- Commit format: `type(scope): subject` (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- Entity schema changes: Update `src/global/db/entities/README.md`

## Tech Stack

- NestJS 11.x + Fastify + MikroORM 6.x + Redis + SWC
- argon2 (password hashing), class-validator, pino logging
- Jest 30.x (testing), oxlint/oxfmt (lint/format), pnpm 10.x

## Development Patterns

**Controllers**: Thin layer - simple service calls and boolean checks only. Use `@UseGuards(AuthGuard)`, `@CurrentUser()`, and `HttpContextService` for cookies.

**Services**: Handle core business logic. Keep functions atomic and focused. Log request start/end and key parameters.

**Database**: Use MikroORM exclusively for queries. Use `IdService.genPrimaryKey()` and `IdService.genSnowflakeId()`. Use `EntityManager` for transactions. No data migrations.

**Security**: Use `argon2` for password hashing. Use session + Redis for auth. Use `class-validator` for all input validation.

## Testing

**Unit Tests** (`*.spec.ts` in feature dirs):
- Mock EntityRepository, EntityManager, and Redis
- Use `jest.spyOn()` and `jest.mock()`
- Test normal flows, edge cases, and error handling

**E2E Tests** (`test/*.e2e-spec.ts`):
- Use `app.inject()` with FastifyAdapter
- Test HTTP status, response format, and auth failures
- Mock external dependencies

## TypeScript

- `strictNullChecks: true`
- Use `interface` for objects, `type` for aliases
- Avoid `any` (except in test files)
- Use `as Type` instead of `<Type>`
- Use `import type` for type-only imports
- Use `?:` for optional properties
