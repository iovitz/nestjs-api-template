# AI开发指南

## 项目概述

本平台旨在为用户提供一个便捷的图书管理环境。用户可在平台进行登录注册，登录后即可进行图书的添加、删除、查询等操作。

## 项目架构概览

基于NestJS + MikroORM + Redis的现代化后端架构，采用模块化设计，包含完整的异常处理、日志记录、API测试等规范。

## 技术栈

- **框架**: NestJS 11.x
- **ORM**: MikroORM 6.x (PostgreSQL)
- **缓存**: Redis (ioredis)
- **验证**: class-validator + class-transformer
- **密码**: argon2
- **日志**: pino + nestjs-pino
- **服务器**: Fastify
- **测试**: Jest + Supertest
- **格式化**: oxfmt
- **Linting**: oxlint
- **包管理**: Bun

## 构建、代码检查与测试命令

### 构建
- `pnpm build`: 使用 Nest CLI 构建项目
- `pnpm start:prod`: 运行生产环境构建

### 代码检查与格式化
- `pnpm lint`: 使用 oxlint 进行代码检查
- `pnpm lint:fix`: 自动修复代码检查问题
- `pnpm format`: 使用 oxfmt 检查代码格式
- `pnpm format:fix`: 自动修复代码格式问题

### 测试
- `pnpm test`: 使用 Jest 运行所有单元测试
- `pnpm test:watch`: 以监听模式运行测试
- `pnpm test:cov`: 运行测试并生成覆盖率报告
- `pnpm test:debug`: 以调试模式运行测试 (支持断点调试)
- `pnpm test:e2e`: 运行端到端测试
- **运行单个测试**: `pnpm test -- src/path/to/test.spec.ts`
- **运行特定测试模式**: `pnpm test -- --testNamePattern="should create user"`
- **API 测试**: `pnpm yac -n <api-name>` (从 api-test.http 运行特定 API 测试)

### 数据库迁移
- `pnpm migration:initial`: 创建初始迁移
- `pnpm migration:create`: 创建新的迁移文件
- `pnpm migration:up`: 执行所有待处理的迁移
- `pnpm migration:down`: 回滚最后一次迁移
- `pnpm migration:pending`: 查看待处理的迁移
- `pnpm migration:list`: 列出所有迁移状态

### 开发服务器
- `pnpm dev`: 启动开发服务器 (带热重载)
- `pnpm start:debug`: 启动调试模式服务器
- `pnpm start`: 启动生产模式服务器 (无热重载)

## 功能需求

### 用户登录

用户通过账号密码登录平台，进入个人操作界面。

- **用户注册**：用户可通过注册页面填写账号、密码、手机号等信息进行注册。
- **账号密码登录**：用户输入账号密码，平台验证通过后，登录成功，进入个人操作界面。

### 图书管理

- **图书添加**：用户登录后，可在个人操作界面添加图书信息，包括图书名称、作者、出版社、ISBN 等。
- **图书删除**：用户登录后，可在个人操作界面删除已添加的图书信息。
- **图书查询**：用户登录后，可在个人操作界面查询已添加的图书信息，包括根据图书名称、作者、出版社等进行筛选。

## 非功能需求

### 安全需求

- **用户账号密码采用加密存储方式**。
- **对接口调用进行身份认证和授权**，防止未授权访问。
- **定期进行安全漏洞检测和修复**，保障系统安全。

---

## 核心规范

### API测试规范

- **工具**: 使用httpyac进行接口测试
- **文件**: 所有测试用例集中放在`api-test.http`
- **命名**: 采用`模块.操作.状态`格式（如`book.create`、`user.login.success`）
- **运行**: `pnpm yac -n <api-name>`
- **变量**: 支持环境变量、随机变量、自定义变量

### 日志记录标准

- **使用方式**: 每个类必须创建自己的私有Logger实例
- **格式要求**: 清晰描述操作和结果，包含关键上下文
- **敏感信息**: 严禁记录密码等敏感数据
- **异常日志**: 必须包含完整的错误信息和堆栈

### 版本管理原则

- **强制精确版本**: 所有依赖必须使用精确版本号
- **禁止**: ^、~、*、latest等版本范围前缀
- **目的**: 确保项目稳定性和可重现性

### 提交消息规范

- **工具**: commitlint + husky
- **格式**: `type(scope): subject`
- **允许类型**:
  - `feat`: 新功能
  - `fix`: 修复bug
  - `docs`: 文档更新
  - `style`: 代码格式调整
  - `refactor`: 代码重构
  - `perf`: 性能优化
  - `test`: 测试相关
  - `build`: 构建系统变更
  - `ci`: CI配置变更
  - `chore`: 其他变更
  - `revert`: 回滚提交
- **规则**: 小写类型，首字母大写主题，最大100字符

### Entity实体规范

- **位置**: 所有Entity实体必须生成在`db`模块的`entities`目录下
- **路径**: `src/global/db/entities/`
- **命名**: 采用`[name].entity.ts`格式（如`user.entity.ts`、`book.entity.ts`）
- **继承**: 所有Entity必须继承自`EntityBase`基类

## 代码风格指南

### 导入规范
- 顺序：先外部包，再内部模块
- 将相关导入分组
- 内部模块使用绝对导入（例如：`import { User } from "src/global/db/entities/user.entity";`）
- 尽可能使用命名导入

### 格式规范
- **工具**: oxfmt（配置文件：`.oxfmtrc.json`）
- **缩进**: 2 个空格（遵循 NestJS 约定）
- **行长度**: 120 个字符
- **分号**: 语句结束使用分号
- **大括号**: 左大括号与语句同行，右大括号另起一行
- **空格**: 运算符周围 1 个空格，括号内部无空格

### 类型规范
- **TypeScript**: 启用严格空检查 (`strictNullChecks: true`)
- **接口/类型**: 对象结构使用接口，别名使用 type
- **Any 类型**: 除测试文件外，避免使用 `any` (测试文件允许)
- **类型断言**: 使用 `as Type` 而非 `<Type>`
- **泛型**: 可复用组件使用泛型
- **可选属性**: 使用 `?:` 而非联合类型 `| undefined`
- **导入类型**: 对于仅作为类型使用的导入，使用 `import type` 语法

### 命名规范
- **PascalCase**: 类名（例如：`UserService`）、接口、类型、实体名称
- **camelCase**: 变量名、方法名、参数名
- **kebab-case**: 文件名（例如：`user.service.ts`）、目录名
- **SNAKE_CASE**: 常量、环境变量
- **前缀/后缀**: 控制器：`[name].controller.ts`，服务：`[name].service.ts`，DTO：`[name].dto.ts`，实体：`[name].entity.ts`

### 错误处理规范
- **NestJS 异常**: 使用内置异常（例如：`NotFoundException`、`ConflictException`）
- **自定义异常**: 扩展 `HttpException` 实现自定义错误
- **错误信息**: 描述清晰但不过于冗长
- **Try/Catch**: 异步操作使用 try/catch 捕获错误
- **验证**: 使用 class-validator 进行 DTO 验证

## 开发最佳实践

### 任务执行原则

- **任务优先**: 当任务没有完成时，专注于核心逻辑实现，不要修复格式错误问题
- **格式优化**: 任务完成后确保逻辑正确，再进行格式问题的修复和优化
- **逻辑验证**: 优先保证功能正确性和业务逻辑完整性
- **清除冗余**: 迭代过程中产生的不被使用的代码和注释必须删除，有类似的代码逻辑可以合并抽离成新函数以复用
- **改动调优**：任务TODO完成后必须对所有改动到的文件进行Review，检查逻辑是否有更好的实现方式，注释是否错误，并修正错误
- **代码检查**: 任务完成后必须运行 `pnpm lint` 和 `pnpm format` 确保代码质量
- **测试验证**: 重要功能变更后必须运行相关测试，确保功能正常工作

### Controller开发

- 控制器层不能包含复杂的业务逻辑，只能做简单的service调用和bool判断
- 使用日志记录请求开始、结束和关键参数
- 使用 HttpMessageService 处理 Cookie 设置和清除
- 使用 @UseGuards(AuthGuard) 保护需要认证的接口
- 使用 @CurrentUser() 装饰器获取当前用户信息

### Service开发

- Service层主要负责业务逻辑
- 注意代码的鲁棒性，如果有必要可以将业务逻辑抽象成多个Service
- 使用日志记录请求开始、结束和关键参数
- 使用 IdService 生成主键和雪花ID
- 使用 EntityManager 进行数据库事务操作

### 数据库设计原则

- **ORM优先**: 必须使用 `MikroORM` 进行实体字段类型定义，严禁使用原生 SQL 语句
- **文档更新**: Schema变更时必须更新[Entity 实体文档](./src/global/db/entities/README.md)

### 安全规范

- **密码存储**: 使用 argon2 进行密码哈希，严禁明文存储
- **敏感信息**: 严禁在日志中记录密码等敏感信息
- **身份验证**: 使用 session + Redis 实现身份验证和授权
- **输入验证**: 使用 class-validator 进行所有 DTO 输入验证
- **错误信息**: 避免泄露敏感信息，通过异常消息

## 接口测试

1. 查看现有API测试示例：`api-test.http`
2. 在 `api-test.http` 中新增功能API记录
3. 测试验证：`pnpm yac -n <api-name>`

## 代码目录规范

项目采用模块化设计，将功能划分为不同的模块以提高可维护性和可扩展性。

### 项目结构

```plain
src/
├── app.module.ts          # 应用根模块，整合全局模块和功能模块
├── main.ts               # 应用入口文件
├── mikro-orm.config.ts   # MikroORM配置文件
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
│   ├── ...
└── shared/               # 共享组件
    └── dto/              # 共享数据传输对象
```

## 文档编写规范

### 内容标准

- **格式**: 采用Markdown格式，保持层级清晰
- **代码示例**: 使用代码块并标明语言类型，如 ```typescript

### 编写原则

- 避免冗余描述，直接阐述核心要点
- 不要在文档中使用系统中的具体代码，使用你理解之后的Demo代码
- 明确标注推荐做法和需要避免的做法
- 不要引用项目中的任何文件
- 提供具体的命令和配置示例
- 和用户交互以及文档编写时必须使用中文

## 开发环境配置

- **Node.js**: >= 20.0.0
- **Bun**: >= 1.0.0 (推荐包管理器)
- **包管理器**: 使用 `bun` 而非 `npm` 或 `pnpm`

## Cursor/Copilot 规则

本项目未配置专门的 Cursor 规则 (`.cursor/rules/`) 或 Copilot 指令 (`.github/copilot-instructions.md`) 文件。如需添加，请在相应位置创建配置文件。
