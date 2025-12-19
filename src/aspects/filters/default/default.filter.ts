import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import statuses from "statuses";

@Catch(Error)
export class DefaultFilter<T extends Error> implements ExceptionFilter {
  private readonly logger = new Logger(DefaultFilter.name);

  catch(exception: T, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<FastifyRequest>();
    const res = host.switchToHttp().getResponse<FastifyReply>();

    // 记录详细的错误信息
    this.logger.error(exception, "unhandle exception");

    // 设置响应头和状态码
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    res.send({
      code: 50000,
      msg: statuses(HttpStatus.INTERNAL_SERVER_ERROR),
      logId: req.id,
    });
  }
}
