# Codebase Concerns

**Analysis Date:** 2026-02-12

## Tech Debt

**验证码校验未实现:**
- Issue: `register()` 和 `login()` 方法中的验证码校验被跳过
- Files: `src/features/user/user.service.ts:29`, `src/features/user/user.service.ts:56`
- Impact: 任何人都可以绕过验证码进行注册和登录，绕过短信/邮箱验证码限制
- Fix approach: 实现验证码校验逻辑，或从 `VerifyCodeDto` 中移除验证码字段

**Fastify Reply Hack:**
- Issue: 通过 `req.replyRef = reply` 将 Fastify Reply 对象挂载到 Request 上以绕过类型限制
- Files: `src/main.ts:26`
- Impact: 破坏了类型安全性，可能在类型升级时导致运行时错误
- Fix approach: 使用类型断言或扩展 FastifyRequest 类型

**空日志轮转实现:**
- Issue: `logRotating()` 方法是空的占位符
- Files: `src/global/cronjob/cronjob.service.ts:34-37`
- Impact: 日志轮转功能缺失，磁盘可能无限增长
- Fix approach: 实现日志文件轮转逻辑或使用外部日志管理工具

**空返回模式:**
- Issue: `findByEmail()` 在用户不存在时返回 `null`，与 `findById()` 抛出异常的的行为不一致
- Files: `src/features/user/user.service.ts:107-114`
- Impact: 调用方需要处理两种不同的错误模式
- Fix approach: 统一返回行为

## Known Bugs

**无已知bug**

## Security Considerations

**验证码验证缺失:**
- Risk: 注册和登录接口允许无验证码访问
- Files: `src/features/user/user.service.ts`
- Current mitigation: DTO中有验证码字段但未使用
- Recommendations: 实现验证码验证逻辑或移除验证码字段

**密码强度验证不足:**
- Risk: 密码只验证长度(6-20)，未验证复杂度
- Files: `src/features/user/user.dto.ts:13-15`, `src/features/user/user.dto.ts:23-25`
- Current mitigation: 无
- Recommendations: 增加密码复杂度验证(大写字母+小写字母+数字+特殊字符)

**会话管理:**
- Risk: 会话存储在Redis中24小时过期，但无会话续期机制
- Files: `src/features/user/user.service.ts:88-89`
- Current mitigation: 会话超时自动失效
- Recommendations: 实现滑动会话过期机制

**Throttler配置:**
- Risk: 默认60次/分钟限制可能对正常用户过于严格，或对暴力破解防护不足
- Files: `src/global/global.module.ts:97-102`
- Current mitigation: 使用环境变量可配置
- Recommendations: 针对登录接口设置更严格的限制

## Performance Bottlenecks

**日志写入同步:**
- Issue: 生产环境日志使用 `sync: false` 但 `minLength: 4096` 可能导致大请求时缓冲延迟
- Files: `src/global/global.module.ts:82-88`
- Cause: 日志写入配置
- Improvement path: 考虑使用异步日志收集或外部日志服务

## Fragile Areas

**空日志轮转:**
- Files: `src/global/cronjob/cronjob.service.ts:34-37`
- Why fragile: 空方法会导致日志无限增长最终耗尽磁盘
- Safe modification: 不要依赖此方法进行日志轮转，使用外部工具

**ID生成器无配置验证:**
- Files: `src/global/id/id.service.ts:10`
- Why fragile: 雪flake ID的epoch时间未验证，可能导致ID冲突
- Safe modification: 在启动时验证epoch配置

## Scaling Limits

**Redis单连接:**
- Current capacity: 单Redis连接处理所有会话和缓存
- Limit: 连接数、内存、带宽
- Scaling path: 使用Redis集群或连接池

**数据库连接:**
- Current capacity: 未配置连接池大小
- Limit: PostgreSQL默认连接限制
- Scaling path: 配置MikroORM连接池

## Dependencies at Risk

**pino@10.2.0:**
- Risk: 较旧版本，可能存在已知漏洞
- Impact: 日志系统
- Migration plan: 升级到最新稳定版本

**eciesjs@0.4.17:**
- Risk: 加密库更新较慢
- Impact: 敏感数据加密
- Migration plan: 定期检查更新，考虑替代方案

## Missing Critical Features

**验证码系统:**
- Problem: 注册和登录需要验证码但验证逻辑未实现
- Blocks: 生产环境上线

**日志轮转:**
- Problem: 生产环境日志无限增长
- Blocks: 长期运行的服务

**单元测试覆盖:**
- Problem: 无服务层单元测试
- Files: `src/features/user/user.service.ts`, `src/global/crypto/crypto.service.ts`
- Risk: 重构可能导致未知问题

## Test Coverage Gaps

**服务层无单元测试:**
- What's not tested: `UserService`, `CryptoService`, `IdService`, `HttpContextService`
- Files: `src/features/user/user.service.ts`, `src/global/crypto/crypto.service.ts`
- Risk: 业务逻辑变更无法被及时验证
- Priority: High

**E2E测试有限:**
- What's not tested: 边界条件、错误场景、并发场景
- Files: `test/user.e2e-spec.ts`
- Risk: 集成问题可能漏测
- Priority: Medium

**AuthGuard未充分测试:**
- What's not tested: 会话过期、非法会话数据、Redis错误
- Files: `src/aspects/guards/auth.guard.ts`
- Risk: 认证绕过可能未被发现
- Priority: High

---

*Concerns audit: 2026-02-12*
