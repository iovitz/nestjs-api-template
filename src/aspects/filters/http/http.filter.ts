import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<FastifyRequest>()
    const res = host.switchToHttp().getResponse<FastifyReply>()
    const status = exception.getStatus()

    res.status(status)
    res.send({
      code: status * 100,
      msg: exception.message,
      logId: req.id,
    })
  }
}
