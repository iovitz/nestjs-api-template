# Coding Conventions

**Analysis Date:** 2026-02-12

## Naming Patterns

**Files:**
- PascalCase for all files: `UserService.ts`, `UserController.ts`, `CryptoService.ts`
- Feature files grouped: `user.service.ts`, `user.controller.ts`, `user.dto.ts`
- Aspect files: `auth.guard.ts`, `validation.filter.ts`, `formatter.interceptor.ts`

**Functions:**
- camelCase for all functions: `register()`, `login()`, `findById()`, `hashPassword()`
- Private methods prefixed with `private`: `private generateSessionId()`
- Service methods typically async: `async register()`, `async login()`

**Variables:**
- camelCase: `userRepository`, `redisClient`, `hashedPassword`
- Constants: camelCase (e.g., `const isProd = ...`)
- TypeScript property declarations with `readonly` for injected dependencies

**Types:**
- PascalCase for interfaces and classes: `RegisterDto`, `LoginDto`, `User`
- Interfaces for DTOs: `PaginationDto`, `VerifyCodeDto`, `CookieOptions`
- Type aliases: camelCase where applicable

## Code Style

**Formatting:**
- Tool: oxlint (includes oxfmt for formatting)
- Configuration: `oxlintrc` (not found, using defaults)
- Run formatting: `pnpm format`

**Linting:**
- Tool: oxlint 1.39.0
- Run linting: `pnpm lint`
- Run with fix: `pnpm lint:fix`

**TypeScript Configuration:**
- File: `tsconfig.json`
- Target: ES2023
- Module: nodenext
- Strict null checks: enabled
- Strict bind call apply: disabled
- No implicit any: disabled
- Decorator metadata: enabled
- Experimental decorators: enabled

## Import Organization

**Order:**
1. Node.js/built-in modules: `import process from "node:process";`
2. NestJS core: `import { Injectable, Module } from "@nestjs/common";`
3. Third-party packages: `import { Entity, Property } from "@mikro-orm/postgresql";`
4. Local absolute imports with `src/` prefix: `import { User } from "src/global/db/entities/user.entity";`
5. Relative imports for same module: `import { LoginDto, RegisterDto } from "./user.dto";`

**Path Aliases:**
- `src/*` maps to root: `^src/(.*)$` -> `<rootDir>/$1`
- All local imports use absolute paths from `src/`:
  - `src/global/db/entities/user.entity`
  - `src/features/user/user.service.ts`
  - `src/aspects/decorators/context.decorator.ts`

**Import Patterns:**
```typescript
// Standard service import
import { UserService } from "./user.service";

// DTO imports
import { LoginDto, RegisterDto } from "./user.dto";

// Absolute import from src/
import { User } from "src/global/db/entities/user.entity";
import { CryptoService } from "src/global/crypto/crypto.service";
```

## Error Handling

**Philosophy:** Avoid try-catch unless necessary; let errors propagate to the global Filter chain.

**Pattern in Services:**
```typescript
async register({ name, email, password }: RegisterDto) {
  const existingUser = await this.userRepository.findOne({ email });
  if (existingUser) {
    throw new ConflictException("邮箱已被注册");
  }
  // ... rest of logic
}
```

**Global Error Filter Chain (in `src/app.module.ts`):**
- Execution order: bottom to top (ValidationFilter -> HttpFilter -> DefaultFilter)
- ValidationFilter: Handles class-validator validation errors
- HttpFilter: Handles HTTP-related exceptions
- DefaultFilter: Catches all unhandled errors (returns 500)

**Exception Types Used:**
- `ConflictException` (409): "邮箱已被注册"
- `NotFoundException` (404): "用户不存在"
- `UnauthorizedException` (401): "邮箱或密码错误", "账号状态异常"

**Response Format:**
```typescript
// From DefaultFilter
{
  code: 50000,
  msg: "Internal Server Error",
  logId: req.id
}
```

## Logging

**Framework:** nestjs-pino (integrated with NestJS)

**Logger Usage:**
```typescript
import { Logger } from "nestjs-pino";

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);

  onModuleInit() {
    this.logger.log("Loaded ECIES keys from environment");
  }
}
```

**Log Levels:** Configurable via `LOG_LEVEL` env var (default: "info")

**Request Logging:**
- Custom pino configuration in `GlobalModule`
- Logs: path, method, status, responseTime
- Request/response logging via `customReceivedObject`, `customSuccessObject`, `customErrorObject`

## Comments

**When to Comment:**
- Complex logic (explained in Chinese comments)
- TODOs for incomplete features
- Business rules or validation explanations

**Examples from Codebase:**
```typescript
// 检查邮箱是否已存在
const existingUser = await this.userRepository.findOne({ email });

// 加密密码
const hashedPassword = await this.cryptoService.hashPassword(password);

// 将session写入Redis，设置24小时过期时间
await this.redisClient.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));

// TODO 校验验证码
```

## Function Design

**Parameters:**
- Use DTOs for request bodies: `register(@Body() body: RegisterDto)`
- Use param decorators for context: `@CurrentUser() currentUser: AuthedUser`

**Return Values:**
- Return raw data or objects (FormatterInterceptor wraps responses)
- Services return entity data or null
- Controllers delegate to services

**Async/Await:**
- All database and external service calls are async
- Use `await` for promise-based operations

## Module Design

**Exports:**
- Services exported via module `exports` array
- DTOs exported from feature files for import in controllers/tests
- No barrel files (`index.ts`) for re-exports

**Dependency Injection:**
- Constructor injection for all services
- `@Inject()` for non-class tokens (e.g., `REDIS_CLIENT`)
- Repository injection via `@InjectRepository(Entity)`

## DTO and Validation

**Validation Framework:** class-validator with class-transformer

**Pattern:**
```typescript
import { IsEmail, IsString, Length } from "class-validator";

export class RegisterDto {
  @IsString()
  @Length(2, 10)
  name: string;

  @IsEmail()
  @Length(4, 32)
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;
}
```

**Global ValidationPipe (in `app.module.ts`):**
- Returns 422 UNPROCESSABLE_ENTITY on validation failure
- Uses custom `exceptionFactory`

## Response Format

**Global FormatterInterceptor:**
- Wraps all successful responses:
```typescript
{
  data: <actual_response_data>,
  code: 0,
  msg: "success"
}
```

**Skip Format:** Use `@SkipFormat()` decorator to bypass wrapping (for non-JSON responses)

## Class Structure

**Services:**
- Decorated with `@Injectable()`
- Constructor injects dependencies
- Public methods for business logic
- Private helper methods for internal logic

**Controllers:**
- Decorated with `@Controller("prefix")`
- Route handlers with `@Get`, `@Post`, etc.
- Use `@HttpCode()` for status codes
- Use `@UseGuards()` for auth

**Entities (MikroORM):**
- Decorated with `@Entity({ tableName: "..." })`
- Properties with `@Property()` decorators
- Extend `EntityBase` for common fields (id, createdAt, updatedAt)

---

*Convention analysis: 2026-02-12*
