# 异常处理规范文档

## 概述

本文档定义了 NestJS 应用中的异常处理规范和最佳实践。系统采用分层异常处理策略，确保不同类型的异常得到适当的处理和响应。

## 异常处理架构

### 异常过滤器链

系统配置了三个异常过滤器，优先级从上到下：

1. **ValidationFilter** - 处理数据验证异常
2. **HttpFilter** - 处理 HTTP 异常
3. **DefaultFilter** - 处理所有其他未捕获的异常

过滤器配置在 [`src/app.module.ts`](../src/app.module.ts) 中：

### 响应格式标准

所有异常响应都遵循统一的格式：

```typescript
interface ErrorResponse {
  code: number // 错误码
  msg: string // 错误消息
  logId?: string // 日志ID (可选)
  detail?: any // 详细信息 (可选，主要用于验证错误)
}
```

## 最佳实践

### 1. 抛出适当的异常

```typescript
// 推荐：使用 NestJS 内置的 HTTP 异常
throw new BadRequestException('参数错误')
throw new NotFoundException('资源未找到')
throw new UnauthorizedException('未授权访问')

// 避免：直接抛出普通 Error
throw new Error('错误消息') // 这将触发 DefaultFilter
```

### 2. 自定义异常

当需要自定义异常时，应继承 `HttpException`：

```typescript
import { HttpException, HttpStatus } from '@nestjs/common'

export class BusinessException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status)
  }
}
```
