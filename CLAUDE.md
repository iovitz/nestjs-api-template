# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS-based backend server with PostgreSQL database (MikroORM), Redis caching, and Fastify web framework.

## Architecture

### Module Structure

- `src/app.module.ts` - Root module with global providers (interceptors, filters, guards, pipes)
- `src/features/` - Feature modules (user, health, etc.) following domain-driven design
- `src/global/` - Global module with cross-cutting concerns:
  - `crypto/` - Cryptographic services (Ed25519 signing/verification, argon2 password hashing)
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

### Key Patterns

- **Auth**: Session-based auth using Redis. Use `@UseGuards(AuthGuard)` and `@CurrentUser()` decorator for protected routes
- **Request validation**: DTOs with class-validator, global ValidationPipe (returns 422 on error)
- **Response format**: Global `FormatterInterceptor` wraps all responses
- **Error handling**: Filter chain (ValidationFilter → HttpFilter → DefaultFilter)

### Code Conventions

- Follow the project's existing code style and patterns
- Avoid try-catch unless necessary; let errors propagate to the global Filter
- Write only e2e tests and service unit tests; skip controller unit tests
- Use DTOs for parameter validation
- When writing Markdown docs, avoid tables; use lists instead
- When getting config, use `configService.getOrThrow()` for required config, or `configService.get()` for optional config

### Delivery Self-Check List

1. [ ] Review your code changes for better implementation, unused variables, or functions
2. [ ] Check for any unused variables or functions generated during coding
3. [ ] Verify `pnpm lint` and `pnpm build` pass
4. [ ] If modifying services, ensure unit tests are written
5. [ ] If adding new endpoints, ensure e2e tests are written
6. [ ] Update documentation if needed
