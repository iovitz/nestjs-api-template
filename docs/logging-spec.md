# 日志使用规范文档

## 概述

本文档定义了 NestJS 应用中的日志使用规范和最佳实践。系统采用结构化的日志记录方式，确保日志的可读性、可追踪性和可维护性。

## 日志架构

### 日志级别

系统使用以下日志级别，按严重程度递增：

1. **TRACE** - 追踪信息，最详细的调试信息
2. **DEBUG** - 调试信息，仅在开发环境使用
3. **LOG** - 一般信息，记录系统运行状态
4. **WARN** - 警告信息，记录潜在问题
5. **ERROR** - 错误信息，记录系统异常
6. **FATAL** - 致命错误，系统无法继续运行

### 日志服务

系统使用 NestJS 内置的 Logger 服务，通过依赖注入方式使用：

```typescript
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  // ...
}
```

## 日志格式标准

### 日志消息格式

日志消息应该清晰、简洁、有意义：

```typescript
// 推荐：清晰描述操作和结果
this.logger.log('用户登录成功', { userId: user.id, username: user.username })

// 避免：模糊的日志消息
this.logger.log('处理完成')
```

## 最佳实践

### 1. 日志上下文

每个服务类都应该设置自己的上下文日志对象：

```typescript
import { Logger } from '@nestjs/common'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  async createUser(dto: CreateUserDto): Promise<User> {
    this.logger.log('创建新用户', { username: dto.username })
    // ...
  }
}
```

### 2. 异常日志记录

记录异常时必须包含完整的错误信息：

```typescript
try {
  await this.userRepository.persistAndFlush(user)
}
catch (error) {
  this.logger.error('创建用户失败', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    userId: user.id,
    username: user.username
  })
  throw new InternalServerErrorException('创建用户失败')
}
```

### 3. 敏感信息处理

严禁在日志中记录敏感信息：

```typescript
// 错误：记录密码
this.logger.log('用户登录', { password: user.password })

// 正确：只记录非敏感信息
this.logger.log('用户登录', { userId: user.id })
```

## 日志使用场景

### 控制器层

记录请求的开始、结束和关键参数：

```typescript
@Get(':id')
async getUserById(@Param('id') id: string, @Req() req: Request) {
  this.logger.log('查询用户详情', { userId: id, traceId: req.headers['x-trace-id'] })
  const user = await this.userService.findOne(id)
  this.logger.log('用户查询完成', { userId: id, found: !!user })
  return user
}
```

### 服务层

记录业务逻辑的关键步骤：

```typescript
async validateUserCredentials(username: string, password: string): Promise<User> {
  this.logger.log('验证用户凭据', { username })

  const user = await this.findByUsername(username)
  if (!user) {
    this.logger.warn('用户不存在', { username })
    return null
  }

  const isValid = await this.comparePasswords(password, user.password)
  if (!isValid) {
    this.logger.warn('密码验证失败', { userId: user.id })
    return null
  }

  this.logger.log('用户凭据验证成功', { userId: user.id })
  return user
}
```

### 数据访问层

记录数据库操作：

```typescript
async createUser(userData: CreateUserDto): Promise<User> {
  this.logger.log('创建用户', { username: userData.username })

    const user = this.userRepository.create(userData)
    await this.userRepository.persistAndFlush(user)

    this.logger.log('创建用户成功', { userId: user.id })
    return user
  }
}
```
