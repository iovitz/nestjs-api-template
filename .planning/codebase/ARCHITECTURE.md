# Architecture

**Analysis Date:** 2026-02-12

## Pattern Overview

**Overall:** Modular monolith with domain-driven feature organization and cross-cutting aspects

**Key Characteristics:**
- NestJS application with Fastify adapter for high-performance HTTP handling
- Global module provides cross-cutting infrastructure (DB, Redis, crypto, ID generation)
- Feature modules encapsulate domain logic following DDD principles
- Global filter chain handles errors with fallback to 500 for unhandled exceptions
- Global interceptor wraps all responses in standard format `{ data, code, msg }`
- Session-based authentication using Redis with cookie transport

## Layers

**Root Layer (`src/app.module.ts`):**
- Purpose: Application bootstrap and global provider registration
- Location: `src/app.module.ts`
- Contains: Root module importing GlobalModule and FeaturesModule
- Registers global interceptors (FormatterInterceptor), pipes (ValidationPipe), filters, and guards (ThrottlerGuard)

**Global Module Layer (`src/global/`):**
- Purpose: Cross-cutting infrastructure services
- Location: `src/global/`
- Contains:
  - `db/` - MikroORM PostgreSQL database configuration and entities
  - `redis/` - Redis connection module for caching and sessions
  - `crypto/` - Password hashing (Argon2) and ECIES encryption services
  - `id/` - Snowflake ID generation for distributed primary keys
  - `http-context/` - Request-scoped cookie and header manipulation
  - `cronjob/` - Scheduled task service
- Exports: IdService, HttpContextService, CryptoService

**Aspects Layer (`src/aspects/`):**
- Purpose: Cross-cutting concerns decorators, filters, guards, interceptors
- Location: `src/aspects/`
- Contains:
  - `decorators/` - Custom parameter decorators (@CurrentUser, @ClientIP)
  - `filters/` - Filter chain (ValidationFilter → HttpFilter → DefaultFilter)
  - `guards/` - AuthGuard (session-based), ThrottlerGuard
  - `interceptors/` - FormatterInterceptor for response standardization

**Features Layer (`src/features/`):**
- Purpose: Domain-specific modules with controller-service-entity pattern
- Location: `src/features/`
- Contains: Feature modules (health, user) with their own DTOs, controllers, services, and entities
- Depends on: GlobalModule services and database entities

**Shared Layer (`src/shared/`):**
- Purpose: Reusable DTOs across features
- Location: `src/shared/dto/`
- Contains: PaginationDto, SortDto, TimeRangeDto, VerifyCodeDto

## Data Flow

**HTTP Request Flow:**

1. Request arrives at Fastify server (`src/main.ts`)
2. ThrottlerGuard checks rate limits (global guard from `src/aspects/guards/throttler.guard.ts`)
3. ValidationPipe validates DTOs and returns 422 on error
4. Controller receives validated request body/query/params
5. Controller calls Service methods
6. Service layer:
   - Uses EntityRepository for database operations
   - Uses Redis client for session management
   - Uses CryptoService for password/encryption operations
7. Service returns data to Controller
8. FormatterInterceptor wraps response: `{ data, code: 0, msg: "success" }`
9. Filter chain catches any thrown exceptions:
   - ValidationFilter handles validation errors
   - HttpFilter handles HTTP errors
   - DefaultFilter catches unhandled errors as 500

**Authentication Flow:**

1. User posts to `/api/user/login` with email/password
2. UserService validates credentials against database
3. UserService generates session via IdService.genSnowflakeId()
4. Session data stored in Redis: `session:{sessionId}` with 24-hour TTL
5. Session ID set as `session` cookie via HttpContextService
6. Protected routes use @UseGuards(AuthGuard)
7. AuthGuard reads cookie, validates session in Redis, attaches user to request
8. @CurrentUser() decorator extracts user from request

## Key Abstractions

**Entity Pattern:**
- Location: `src/global/db/entities/`
- Base class: `EntityBase` with id, createdAt, updatedAt
- Concrete entities: `User` extends EntityBase
- Uses MikroORM decorators (@Entity, @Property) with PostgreSQL

**Service Pattern:**
- Location: Feature modules (e.g., `src/features/user/user.service.ts`)
- Decorated with @Injectable()
- Injects EntityRepository, EntityManager, and global services
- Handles business logic, data transformation, and external service calls

**Controller Pattern:**
- Location: Feature modules (e.g., `src/features/user/user.controller.ts`)
- Decorated with @Controller() with route prefix
- Uses DTOs for request validation via class-validator
- Returns data directly (FormatterInterceptor wraps response)
- Uses @UseGuards(AuthGuard) for protected routes
- Uses @CurrentUser() decorator to extract authenticated user

**Repository Pattern:**
- Location: Injected via @InjectRepository(Entity) from MikroORM
- Provides CRUD operations: find(), findOne(), create(), persistAndFlush()

## Entry Points

**Main Entry (`src/main.ts`):**
- Location: `src/main.ts`
- Triggers: `node dist/main` or `nest start`
- Responsibilities:
  - Creates NestFactory with FastifyAdapter
  - Generates request IDs via Snowflake ID
  - Registers @fastify/cookie plugin
  - Configures pino logger
  - Starts HTTP server on configured host/port
  - Handles unhandled promise rejections

**App Module (`src/app.module.ts`):**
- Location: `src/app.module.ts`
- Triggers: Imported by main.ts bootstrap
- Responsibilities:
  - Imports GlobalModule and FeaturesModule
  - Registers global providers (interceptors, pipes, filters, guards)

**Database Configuration (`src/mikro-orm.config.ts`):**
- Location: `src/mikro-orm.config.ts`
- Triggers: Called by DbModule for root and CLI commands
- Responsibilities:
  - Configures PostgreSQL connection
  - Discovers entities from `dist/**/entities/*.entity.js`
  - Configures migrations and seeders

## Error Handling

**Strategy:** Filter chain with progressive error handling

**Patterns:**
- Global ValidationPipe converts class-validator errors to 422
- Filter chain order (registered bottom-to-top in `app.module.ts`):
  1. ValidationFilter - Handles validation errors
  2. HttpFilter - Handles HTTP errors
  3. DefaultFilter - Catches unhandled exceptions as 500
- Services throw NestJS exceptions (ConflictException, NotFoundException, etc.)
- Avoid try-catch in services; let errors propagate to filters

## Cross-Cutting Concerns

**Logging:**
- Framework: nestjs-pino with pino backend
- Configuration: Configured in GlobalModule for root
- Request/response logging with response time
- Log level controlled by LOG_LEVEL env var
- Production: Writes to ./app.log asynchronously
- Development: Uses pino-pretty for colored console output

**Validation:**
- Framework: class-validator with class-transformer
- Global ValidationPipe in app.module.ts
- Returns 422 UNPROCESSABLE_ENTITY on validation failure
- DTOs define validation rules with decorators (@IsEmail, @MinLength, etc.)

**Authentication:**
- Session-based with Redis storage
- Session ID generated via Snowflake ID
- Session stored with 24-hour TTL
- Session ID transported via httpOnly cookie
- @UseGuards(AuthGuard) protects routes
- @CurrentUser() extracts authenticated user from request

**Rate Limiting:**
- Framework: @nestjs/throttler
- Two tiers: "default" (60 requests/minute) and "short" (10 requests/20 seconds)
- Configurable via THROTTLE_TTL, THROTTLE_LIMIT env vars

**ID Generation:**
- Framework: @sapphire/snowflake
- Two generators: Snowflake for DB primary keys, TwitterSnowflake for request IDs
- Epoch configurable via SNOWFLAKE_EPOCH env var (default: 2000-01-01)

---

*Architecture analysis: 2026-02-12*
