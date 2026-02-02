# AI开发指南

## 产品定位

xx 是一款面向 xxx 的 xxx 应用，帮助用户 xxx

- 目标用户：xxx
- 核心价值：xxx
- 产品slogan：xxx

## 项目概述

基于 NestJS + MikroORM + Redis 的现代化后端架构，采用模块化设计，包含完整的异常处理、日志记录、API 测试等规范。

### 技术栈

- 框架：NestJS 11.x
- 编译器：SWC (用于快速编译)
- ORM：MikroORM 6.x (PostgreSQL)
- 缓存：Redis (ioredis)
- 验证：class-validator + class-transformer
- 密码：argon2
- 日志：pino + nestjs-pino
- 服务器：Fastify
- 限流：@nestjs/throttler
- 健康检查：@nestjs/terminus
- 定时任务：@nestjs/schedule
- 测试：Jest + Supertest
- 格式化：oxfmt
- Linting：oxlint
- 包管理：pnpm
- 工具：husky + commitlint + commitizen

## 构建、代码检查与测试命令

### 构建
- `pnpm build`：使用 Nest CLI 构建项目
- `pnpm start:prod`：运行生产环境构建

### 代码检查与格式化
- `pnpm lint`：使用 oxlint 进行代码检查
- `pnpm lint:fix`：自动修复代码检查问题
- `pnpm format`：使用 oxfmt 自动修复代码格式问题

### 测试
- `pnpm test`：使用 Jest 运行所有单元测试
- `pnpm test:cov`：运行测试并生成覆盖率报告
- `pnpm test:debug`：以调试模式运行测试 (支持断点调试)
- `pnpm test:e2e`：运行端到端测试

### 开发服务器
- `pnpm dev`：启动开发服务器 (带热重载)
- `pnpm start:debug`：启动调试模式服务器
- `pnpm start`：启动生产模式服务器 (无热重载)

### 其他工具
- `pnpm cz`：使用 commitizen 进行规范化的提交
- `pnpm check-versions`：检查版本一致性

## 核心规范

### 日志记录标准

- 使用方式：每个类必须创建自己的私有 Logger 实例
- 格式要求：清晰描述操作和结果，包含关键上下文
- 敏感信息：严禁记录密码等敏感数据
- 异常日志：必须包含完整的错误信息和堆栈

### 版本管理原则

- 强制精确版本：所有依赖必须使用精确版本号
- 禁止：^、~、*、latest 等版本范围前缀
- 目的：确保项目稳定性和可重现性

### 提交消息规范

- 工具：commitlint + husky
- 格式：`type(scope): subject`
- 允许类型：
  - `feat`：新功能
  - `fix`：修复 bug
  - `docs`：文档更新
  - `style`：代码格式调整
  - `refactor`：代码重构
  - `perf`：性能优化
  - `test`：测试相关
  - `build`：构建系统变更
  - `ci`：CI 配置变更
  - `chore`：其他变更
  - `revert`：回滚提交

- 规则：小写类型，首字母大写主题，最大 100 字符

### Entity 实体规范

- 位置：所有 Entity 实体必须生成在 `db` 模块的 `entities` 目录下
- 路径：`src/global/db/entities/`
- 命名：采用 `[name].entity.ts` 格式（如 `user.entity.ts`）
- 继承：所有 Entity 必须继承自 `EntityBase` 基类

## 代码风格指南

### 导入规范

1. 顺序：先外部包，再内部模块
2. 将相关导入分组
3. 内部模块使用绝对导入（如：`import { User } from "src/global/db/entities/user.entity"`）
4. 尽可能使用命名导入

### 格式规范

- 工具：oxfmt（配置文件：`.oxfmtrc.json`）
- 缩进：2 个空格（遵循 NestJS 约定）
- 行长度：120 个字符
- 分号：语句结束使用分号
- 大括号：左大括号与语句同行，右大括号另起一行
- 空格：运算符周围 1 个空格，括号内部无空格

### 类型规范

- TypeScript：启用严格空检查 (`strictNullChecks: true`)
- 接口/类型：对象结构使用接口，别名使用 type
- Any 类型：除测试文件外，避免使用 `any`（测试文件允许）
- 类型断言：使用 `as Type` 而非 `<Type>`
- 泛型：可复用组件使用泛型
- 可选属性：使用 `?:` 而非联合类型 `| undefined`
- 导入类型：对于仅作为类型使用的导入，使用 `import type` 语法

### 命名规范

- PascalCase：类名（如 `UserService`）、接口、类型、实体名称
- camelCase：变量名、方法名、参数名
- kebab-case：文件名（如 `user.service.ts`）、目录名
- SNAKE_CASE：常量、环境变量

- 前缀/后缀：
  - 控制器：`[name].controller.ts`
  - 服务：`[name].service.ts`
  - DTO：`[name].dto.ts`
  - 实体：`[name].entity.ts`

### 错误处理规范

- 使用内置 NestJS 异常（如 `NotFoundException`、`ConflictException`）
- 自定义异常应扩展 `HttpException` 实现
- 错误信息描述清晰但不过于冗长
- 异步操作使用 try/catch 捕获错误
- 使用 class-validator 进行 DTO 验证

## 开发最佳实践

### 全局配置架构

- 模块结构：应用分为 `GlobalModule`（全局服务）和 `FeaturesModule`（业务功能）
- 全局管道：全局 ValidationPipe 使用 422 状态码处理验证错误
- 全局过滤器：按执行顺序配置异常过滤器（ValidationFilter → HttpFilter → DefaultFilter）
- 全局守卫：ThrottlerGuard 提供全局限流保护
- 全局拦截器：FormatterInterceptor 统一响应格式

### 任务完成 CheckList

- [ ] 专注于核心逻辑的实现，优先保证功能正确性和业务逻辑完整性
- [ ] 是否产生了不被使用的代码和注释，这部分代码和注释必须删除
- [ ] 检查变更的代码是否有更好的实现方式
- [ ] 新的代码逻辑下代码注释是否需要变更，文档是否需要更新
- [ ] 是否存在类似的代码逻辑可以合并抽离成新函数以复用
- [ ] 是否对变更逻辑编写了测试
- [ ] 运行 `pnpm build` 和 `pnpm test`，确保功能正常工作

### Controller 开发

- 控制器层不能包含复杂的业务逻辑，只能做简单的 service 调用和布尔值判断
- 使用日志记录控制器中路由函数在开始以及结束时的关键参数
- 使用 HttpContextService 处理 Cookie 设置和清除
- 使用 `@UseGuards(AuthGuard)` 保护需要认证的接口
- 使用 `@CurrentUser()` 装饰器获取当前用户信息

### Service 开发

- Service 层负责处理主要的业务逻辑
- 每个 Service 中的函数逻辑必须聚焦，原子化要强
- 使用日志记录请求开始、结束和关键参数

### 数据库设计原则

- ORM 优先：必须使用 `MikroORM` 进行实体字段类型定义，严禁使用原生 SQL 语句
- 文档更新：Schema 变更时必须更新 [Entity 实体文档](./src/global/db/entities/README.md)
- 禁止迁移：不要使用任何方式进行数据迁移
- 使用 IdService 生成主键 (`genPrimaryKey()`) 和雪花 ID (`genSnowflakeId()`)
- 使用 EntityManager 进行数据库事务操作

### 安全规范

- 密码存储：使用 argon2 进行密码哈希，严禁明文存储
- 敏感信息：严禁在日志中记录密码等敏感信息
- 身份验证：使用 session + Redis 实现身份验证和授权
- Cookie 管理：使用 @fastify/cookie 处理会话 Cookie
- 输入验证：使用 class-validator 进行所有 DTO 输入验证

### E2E 测试规范

- 文件位置：`test/[module].e2e-spec.ts`
- 测试范围：每个业务模块的每个接口至少编写一个成功请求的测试用例
- 测试方式：使用 FastifyAdapter 和 `app.inject()` 方法发送请求
- 测试内容：
  - 测试接口返回正确的 HTTP 状态码
  - 验证响应数据格式
  - 认证接口需测试未登录时的 401 响应
- Mock 依赖：使用 Jest mock 隔离外部依赖（数据库、Redis 等）
- 清理工作：afterAll 中需关闭应用

### 单元测试规范

- 文件位置：`src/features/[module]/[service].spec.ts`
- 测试范围：Service 层的核心业务逻辑
- 测试方式：使用 Jest + Test.createTestingModule 创建独立测试模块
- Mock 策略：
  - 数据库操作：mock EntityRepository 和 EntityManager
  - Redis 操作：mock Redis 客户端
  - 外部服务：使用 jest.fn() 创建模拟函数
- 测试内容：
  - 测试正常业务流程返回正确结果
  - 测试边界条件和异常处理
  - 验证依赖方法被正确调用
- 测试技巧：使用 `jest.spyOn()` 监控已有方法，使用 `jest.mock()` mock 模块



## 代码目录规范

项目采用模块化设计，将功能划分为不同的模块以提高可维护性和可扩展性。

```
src/
├── app.module.ts          # 应用根模块，整合全局模块和功能模块
├── main.ts               # 应用入口文件
├── mikro-orm.config.ts   # MikroORM 配置文件
├── aspects/              # 切面编程相关组件（装饰器、过滤器、守卫、拦截器）
│   ├── decorators/       # 自定义装饰器
│   ├── filters/          # 异常过滤器
│   ├── guards/           # 守卫
│   └── interceptors/     # 拦截器
├── features/             # 业务功能模块
│   ├── health/           # 健康检查模块
│   └── user/             # 用户模块
│   └── ...
├── global/               # 全局共享模块和组件
│   ├── global.module.ts  # 全局模块，提供全局可用的服务
│   ├── cronjob/          # 定时任务服务
│   ├── db/               # 数据库相关
│   │   ├── db.module.ts  # 数据库模块
│   │   └── entities/     # 所有的数据库实体类
│   └── ...
└── shared/               # 共享组件
    └── dto/              # 共享数据传输对象
```

## 文档编写规范

- 使用 Markdown 格式，保持层级清晰
- 代码示例使用代码块并标明语言类型
- 文档内容要求精简有效，不能冗余啰嗦
- 不要在文档中引用项目中的具体代码或文件
- 禁止使用表格格式

## 开发环境配置

- Node.js：>= 22.0.0
- PNPM：>= 10.0.0（推荐包管理器）
- 包管理器：必须使用 `pnpm`
