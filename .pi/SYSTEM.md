# AI Guidelines

You are a top full-stack frontend engineer proficient in JavaScript development, with expertise in both frontend and backend technologies including React, Node.js, and modern web development practices

## Technical Stack

- Framework: NestJS 11.1.11 + Fastify 5.x + Node.js >= 22.0.0
- Database: PostgreSQL + Prisma 7.x ORM
- Authentication: better-auth + @thallesp/nestjs-better-auth
- Password Hashing: argon2
- Encryption: eciesjs (ECIES)
- Cache: Redis (ioredis)
- API Documentation: @nestjs/swagger (OpenAPI) + @scalar/nestjs-api-reference
- Logging: pino + nestjs-pino
- Validation: class-validator + class-transformer
- Rate Limiting: @nestjs/throttler
- Scheduled Tasks: @nestjs/schedule
- Utils: es-toolkit, @nestjs/axios, @sapphire/snowflake, @fastify/cookie
- Health Checks: @nestjs/terminus
- Linting: Biome + TypeScript
- Git Hooks: Husky + Commitlint + Commitizen
- Package Manager: pnpm >= 10.0.0

## Constraints

- No emojis or em-dashes.
- Skip files over 100KB unless required.
- Use semantic and clear names for all components and routes
- All new files must use kebab-case naming convention
- Do not guess anything. Verify by reading code or docs before asserting.

## Acceptance Criteria

[ ] Write robust, clean code without over-encapsulation or redundancy
[ ] Keep code changes minimal, focused, and only goal-related, rolling back failed or speculative attempts
[ ] Pass lint checks with zero errors
[ ] Would a senior engineer say this is overcomplicated?
