# Codebase Structure

**Analysis Date:** 2026-02-12

## Directory Layout

```
nestjs-api-template/
├── .claude/                     # Claude AI configuration
├── .planning/                   # Planning documents (generated)
│   └── codebase/                # Analysis documents
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
├── .vscode/                     # VSCode settings
├── migrations/                  # Database migrations
├── scripts/                     # Utility scripts
├── src/
│   ├── app.module.ts            # Root module
│   ├── main.ts                  # Application entry point
│   ├── mikro-orm.config.ts      # Database configuration
│   ├── aspects/                 # Cross-cutting concerns
│   │   ├── decorators/          # Custom decorators
│   │   ├── filters/             # Exception filters
│   │   ├── guards/              # Auth and security guards
│   │   └── interceptors/        # Request/response interceptors
│   ├── features/                # Feature modules
│   │   ├── features.module.ts   # Features aggregator
│   │   ├── health/              # Health check module
│   │   └── user/                # User management module
│   ├── global/                  # Global infrastructure
│   │   ├── global.module.ts     # Global module definition
│   │   ├── crypto/              # Cryptographic services
│   │   ├── cronjob/             # Scheduled tasks
│   │   ├── db/                  # Database layer
│   │   │   ├── db.module.ts     # Database module
│   │   │   ├── entities/        # Database entities
│   │   │   └── seeders/         # Database seeders
│   │   ├── http-context/        # HTTP context service
│   │   ├── id/                  # ID generation service
│   │   └── redis/               # Redis module
│   ├── shared/                  # Shared utilities
│   │   └── dto/                 # Reusable DTOs
│   └── types/                   # TypeScript type declarations
├── test/                        # E2E tests
│   ├── app.e2e-spec.ts
│   ├── health.e2e-spec.ts
│   ├── user.e2e-spec.ts
│   └── jest-e2e.json
├── dist/                        # Compiled output (generated)
├── coverage/                    # Test coverage (generated)
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env                         # Environment variables
```

## Directory Purposes

**`src/aspects/`:**
- Purpose: Cross-cutting concerns applied globally
- Contains:
  - `decorators/` - Parameter decorators (@CurrentUser, @ClientIP)
  - `filters/` - Exception filters (validation, http, default)
  - `guards/` - Route guards (AuthGuard, ThrottlerGuard)
  - `interceptors/` - Response formatter interceptor

**`src/features/`:**
- Purpose: Domain-driven feature modules
- Contains: Each feature in its own subdirectory with controller, service, DTO, module files
- Key files:
  - `features.module.ts` - Aggregates all feature modules
  - `health/health.controller.ts` - Health check endpoint
  - `user/` - User CRUD, auth, session management

**`src/global/`:**
- Purpose: Infrastructure services available application-wide
- Contains:
  - `global.module.ts` - Global module definition
  - `crypto/crypto.service.ts` - Password hashing and encryption
  - `db/db.module.ts` - MikroORM database configuration
  - `id/id.service.ts` - Snowflake ID generation
  - `http-context/http-context.service.ts` - Cookie/header manipulation
  - `redis/redis.module.ts` - Redis connection module
  - `cronjob/cronjob.service.ts` - Scheduled task runner

**`src/shared/`:**
- Purpose: Reusable code across features
- Contains:
  - `dto/pagination.dto.ts` - Pagination parameters
  - `dto/sort.dto.ts` - Sorting parameters
  - `dto/time-range-dto.ts` - Time range filter
  - `dto/verify-code.dto.ts` - Verification code

**`src/types/`:**
- Purpose: TypeScript declaration files
- Contains: Global type augmentations and interfaces

**`test/`:**
- Purpose: E2E test files
- Naming: `*.e2e-spec.ts`
- Structure: Supertest-based HTTP tests

## Key File Locations

**Entry Points:**
- `src/main.ts` - Application bootstrap, Fastify setup, middleware hooks
- `src/app.module.ts` - Root module, global provider registration

**Configuration:**
- `src/mikro-orm.config.ts` - MikroORM configuration factory
- `.env` - Environment variables (not committed)
- `.env.sample` - Environment variable template

**Core Logic:**
- `src/global/crypto/crypto.service.ts` - Argon2 password hashing, ECIES encryption
- `src/global/id/id.service.ts` - Snowflake ID generation
- `src/features/user/user.service.ts` - User authentication, session management

**Database:**
- `src/global/db/entities/` - MikroORM entities (User, EntityBase)
- `src/global/db/seeders/` - Database seeders
- `migrations/` - Migration files

**Testing:**
- `test/` - E2E test specifications
- `src/**/*.spec.ts` - Unit tests (in same directory as code)

## Naming Conventions

**Files:**
- PascalCase for modules, services, controllers, entities: `UserService`, `UserController`
- kebab-case for directories: `src/features/user/`
- DTO files: `{feature}.dto.ts` - `user.dto.ts`
- Module files: `{feature}.module.ts` - `user.module.ts`
- Entity files: `{name}.entity.ts` - `user.entity.ts`

**Classes:**
- Controllers: `{Feature}Controller` - `UserController`
- Services: `{Feature}Service` - `UserService`
- Modules: `{Feature}Module` - `UserModule`
- Entities: `{Feature}` - `User`
- DTOs: `{Action}{Feature}Dto` - `LoginDto`, `RegisterDto`
- Filters: `{Purpose}Filter` - `DefaultFilter`, `HttpFilter`
- Guards: `{Purpose}Guard` - `AuthGuard`, `ThrottlerGuard`
- Interceptors: `{Purpose}Interceptor` - `FormatterInterceptor`

**Variables and Functions:**
- camelCase for variables and functions: `userRepository`, `findByEmail()`
- Private methods prefixed with underscore: `_internalMethod()`

**Database:**
- Table names: plural lowercase with underscores: `users`
- Primary keys: `id` (Snowflake string)

## Where to Add New Code

**New Feature:**
1. Create directory: `src/features/{feature-name}/`
2. Create files:
   - `{feature}.module.ts` - Module definition
   - `{feature}.controller.ts` - HTTP endpoints
   - `{feature}.service.ts` - Business logic
   - `{feature}.d.ts` - TypeScript types if needed
3. Update `src/features/features.module.ts` to import new module
4. Add entity if needed: `src/global/db/entities/{feature}.entity.ts`
5. Add tests:
   - E2E: `test/{feature}.e2e-spec.ts`
   - Unit: `src/features/{feature}/{feature}.service.spec.ts`

**New Entity:**
1. Create file: `src/global/db/entities/{entity-name}.entity.ts`
2. Extend `EntityBase` for id, createdAt, updatedAt
3. Use MikroORM decorators: @Entity, @Property
4. Run migration: `pnpm migration:create`
5. Add seeder if needed: `src/global/db/seeders/{entity}.seeder.ts`

**New Service in Global:**
1. Create directory: `src/global/{service-name}/`
2. Create `{service-name}.service.ts` with @Injectable()
3. Add to `src/global/global.module.ts` providers and exports
4. Import and inject in feature services

**New Cross-Cutting Concern:**
1. Place in appropriate `src/aspects/{type}/` directory
2. Create files:
   - `{concern}.ts` or `{concern}/` subdirectory
3. Register in `src/app.module.ts` if global
4. Use decorators for feature-specific concerns

**New Shared DTO:**
1. Add to `src/shared/dto/`
2. Use class-validator decorators for validation rules
3. Import in feature modules that need it

**New Database Migration:**
1. Run: `pnpm migration:create --name {descriptive-name}`
2. Edit generated file in `src/global/db/migrations/`
3. Apply: `pnpm migration:up`
4. Verify: `pnpm migration:list`

**New Database Seeder:**
1. Create: `src/global/db/seeders/{name}.seeder.ts`
2. Extend seeder base class
3. Run: `pnpm seed:run`

## Special Directories

**`migrations/`:**
- Purpose: Database migration history
- Generated: Yes, by MikroORM CLI
- Committed: Yes, version controlled

**`dist/`:**
- Purpose: Compiled JavaScript output
- Generated: Yes, by `pnpm build`
- Committed: No, in `.gitignore`

**`coverage/`:**
- Purpose: Test coverage reports
- Generated: Yes, by `pnpm test:cov`
- Committed: No, in `.gitignore`

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes, by package manager
- Committed: No, in `.gitignore`

**`.planning/codebase/`:**
- Purpose: Architecture and structure documentation
- Generated: Yes, by GSD commands
- Committed: Yes, for team reference

---

*Structure analysis: 2026-02-12*
