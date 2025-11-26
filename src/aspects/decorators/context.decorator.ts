import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'

// 获取用户IP
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>()
    const user = req.user
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  },
)

// 获取用户IP
export const ClientIP = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>()

    const ip = req.cookies.session
      ?? req.cookies['client-id']
      ?? req.ip ?? req.socket?.remoteAddress ?? req.headers['x-forwarded-for']
    if (!ip) {
      throw new Error('Invalid Request')
    }
    return ip.match(/\d+\.\d+\.\d+\.\d+/)?.[0]
  },
)
