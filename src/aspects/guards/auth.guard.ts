import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import Redis from 'ioredis'
import { HttpMessageService } from 'src/global/http-message/http-message.service'
import { REDIS_CLIENT } from 'src/global/redis/redis.module'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly httpMessageService: HttpMessageService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const sessionId = this.httpMessageService.getCookie('session')

    if (!sessionId) {
      throw new UnauthorizedException('请先登录')
    }

    // 从Redis获取session数据
    const key = `session:${sessionId}`
    const sessionData = await this.redisClient.get(key)

    if (!sessionData) {
      throw new UnauthorizedException('会话已过期，请重新登录')
    }

    try {
      const session = JSON.parse(sessionData)
      if (!session.userId) {
        throw new UnauthorizedException('会话数据无效')
      }

      // 将用户信息附加到请求对象上，供后续使用
      request.user = {
        id: session.userId,
      }

      return true
    }
    catch {
      throw new UnauthorizedException('会话数据格式错误')
    }
  }
}
