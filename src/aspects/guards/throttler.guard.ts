import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard as BaseThrottlerGuard } from "@nestjs/throttler";
import { FastifyRequest } from "fastify";

@Injectable()
export class ThrottlerGuard extends BaseThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 调用父类的canActivate方法进行限流检查
    await super.canActivate(context);

    return true;
  }

  protected async getTracker(req: FastifyRequest): Promise<string> {
    return (
      req.cookies.session ??
      req.cookies["client-id"] ??
      req.ip ??
      req.socket?.remoteAddress ??
      req.headers["x-forwarded-for"] ??
      "unknown"
    );
  }
}
