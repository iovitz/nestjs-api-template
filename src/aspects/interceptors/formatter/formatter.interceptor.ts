import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor, SetMetadata } from '@nestjs/common'
import { map, Observable } from 'rxjs'

export const SKIP_RESPONSE_FORMAT_KEY = Symbol('SKIP_RESPONSE_FORMAT_KEY')

// 创建一个自定义装饰器来设置响应元数据
export function SkipFormat() {
  return SetMetadata(SKIP_RESPONSE_FORMAT_KEY, true)
}

@Injectable()
export class FormatterInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FormatterInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler()
    const res = context.switchToHttp().getResponse<FastifyReply>()
    const skipFormat = Reflect.getMetadata(SKIP_RESPONSE_FORMAT_KEY, handler)
    return next.handle().pipe(
      map((data) => {
        if (skipFormat || res.headers['content-type']) {
          this.logger.log(`Skip Response Format`, {
          })
          return data
        }

        return {
          data,
          code: 0,
          msg: 'success',
        }
      }),
    )
  }
}
