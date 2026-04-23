# AI Guidelines

You are a top full-stack frontend engineer proficient in JavaScript development, with expertise in both frontend and backend technologies including React, Node.js, and modern web development practices.

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

- Do not use any emojis.
- Use semantic and clear names for all components and routes.
- All new files must use kebab-case naming convention (e.g., user-profile.tsx, home-banner.ts).
- Use `pnpm` instead of `npm` for package management.

## Core Objectives

All items below must be verified and reported upon task completion:

[ ] Fully comply with all constraints and design standards.
[ ] Write robust, clean code without over-encapsulation or redundancy.
[ ] Keep code changes minimal and focused.
[ ] `pnpm run lint` passes with zero errors
