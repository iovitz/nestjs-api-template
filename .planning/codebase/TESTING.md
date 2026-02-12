# Testing Patterns

**Analysis Date:** 2026-02-12

## Test Framework

**Runner:**
- Jest 30.2.0
- Config: `package.json` (unit) and `test/jest-e2e.json` (e2e)
- Transform: ts-jest 29.4.6

**Assertion Library:**
- Jest built-in `expect`

**Run Commands:**
```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode for development
pnpm test:cov          # Run tests with coverage
pnpm test:e2e          # Run e2e tests only
```

## Test File Organization

**Unit Tests:**
- Pattern: `*.spec.ts` (but none found in codebase)
- Location: Co-located with source files (e.g., `src/features/user/user.service.spec.ts`)
- Root dir: `src/` (configured in package.json)

**E2E Tests:**
- Pattern: `*.e2e-spec.ts`
- Location: `test/` directory
- Config: `test/jest-e2e.json`

**Test File Structure:**
```
test/
├── app.e2e-spec.ts          # App controller tests
├── health.e2e-spec.ts       # Health endpoint tests
└── user.e2e-spec.ts         # User feature tests
```

## E2E Test Structure

**Standard Pattern:**
```typescript
import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./../src/app.module";

describe("Feature (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it("should do something", async () => {
    const resp = await app.inject({
      method: "GET",
      url: "/api/health",
    });
    expect(resp.statusCode).toEqual(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Mocking

**Framework:** Jest mock functions (`jest.fn()`)

**Service Mocking Pattern:**
```typescript
let mockUserService: jest.Mocked<UserService>;

beforeAll(async () => {
  mockUserService = {
    register: jest
      .fn()
      .mockResolvedValue({ id: "1", name: "testuser", email: "test@example.com" }),
    login: jest.fn().mockResolvedValue({
      user: { id: "1", name: "testuser", email: "test@example.com" },
      sessionId: "test-session-id",
    }),
    findById: jest.fn().mockResolvedValue({ id: "1", name: "testuser", email: "test@example.com" }),
  } as any;
});
```

**Mocking in Module:**
```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [UserController],
  providers: [
    { provide: UserService, useValue: mockUserService },
    { provide: HttpContextService, useValue: mockHttpContextService },
    AuthGuard,
    { provide: REDIS_CLIENT, useValue: mockRedis },
  ],
}).compile();
```

**Type Assertions:**
- Use `jest.Mocked<T>` for typed mocks
- Use `as any` for complex partial mocks

**Mocking Example (Redis):**
```typescript
let mockRedis: jest.Mocked<Redis>;

mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue("OK"),
  del: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue("OK"),
  disconnect: jest.fn(),
} as any;
```

## Test Patterns

**HTTP Injection (Fastify):**
```typescript
const resp = await app.inject({
  method: "POST",
  url: "/api/user/register",
  payload: {
    name: "testuser",
    email: "test@example.com",
    password: "password123",
    code: "1234",
  },
});
expect(resp.statusCode).toEqual(201);
expect(mockUserService.register).toHaveBeenCalled();
```

**Assertion Patterns:**
```typescript
expect(resp.statusCode).toEqual(201);
expect(resp.statusCode).toEqual(401);
expect(mockUserService.register).toHaveBeenCalled();
expect(mockHttpContextService.setCookie).toHaveBeenCalledWith("session", "test-session-id");
```

**Describe Block Organization:**
```typescript
describe("POST /api/user/register", () => {
  it("should register a new user and return 201", async () => { ... });
});

describe("GET /api/user/profile", () => {
  it("should return 401 without auth guard", async () => { ... });
});
```

## Jest Configuration

**Unit Test Config (package.json):**
```json
{
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "moduleFileExtensions": ["js", "json", "ts"],
  "moduleNameMapper": { "^src/(.*)$": "<rootDir>/$1" },
  "rootDir": "src",
  "testEnvironment": "node",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

**E2E Config (test/jest-e2e.json):**
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "moduleNameMapper": { "^src/(.*)$": "<rootDir>/../src/$1" },
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

## Coverage

**View Coverage:**
```bash
pnpm test:cov
```

**Coverage Directory:** `coverage/`
**Collect Coverage From:** All `.ts` files in `src/`

## Common Patterns

**Async Testing:**
```typescript
it("should login successfully and return 200", async () => {
  const resp = await app.inject({ ... });
  expect(resp.statusCode).toEqual(200);
});
```

**Auth Guard Testing:**
```typescript
describe("GET /api/user/profile", () => {
  it("should return 401 without auth guard", async () => {
    const resp = await app.inject({
      method: "GET",
      url: "/api/user/profile",
    });
    expect(resp.statusCode).toEqual(401);
  });
});
```

**Cleanup Pattern:**
```typescript
afterAll(async () => {
  const redis = app.get(REDIS_CLIENT);
  await redis.quit();
  redis.disconnect();
  await app.close();
});
```

## What to Test

**E2E Tests (Required for New Endpoints):**
- Controller endpoints
- Auth guards
- Request/response handling
- Error responses

**Unit Tests (Service Tests - Not Yet Implemented):**
- Service business logic
- Database operations
- Cryptographic operations

## Test Guidelines

From CLAUDE.md:
- Write only e2e tests and service unit tests
- Skip controller unit tests
- If adding new endpoints, ensure e2e tests are written

---

*Testing analysis: 2026-02-12*
