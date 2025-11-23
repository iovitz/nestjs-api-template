import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard as BaseThrottlerGuard } from '@nestjs/throttler'
import { FastifyRequest } from 'fastify'

@Injectable()
export class ThrottlerGuard extends BaseThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 调用父类的canActivate方法进行限流检查
    const canActivate = await super.canActivate(context)

    // 如果限流检查通过，返回true
    if (canActivate) {
      return true
    }

    // 如果限流检查失败，可以在这里添加自定义逻辑
    // 例如：记录日志、发送通知、返回自定义错误信息等

    return false
  }

  protected async getTracker(req: FastifyRequest): Promise<string> {
    return req.cookies.session
      ?? req.cookies['client-id']
      ?? req.ip ?? req.socket?.remoteAddress ?? req.headers['x-forwarded-for'] ?? 'unknown'
  }
}
