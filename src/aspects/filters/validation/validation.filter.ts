import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import statuses from 'statuses'

@Catch(ValidationError)
export class ValidationFilter<T extends ValidationError> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<FastifyReply>()

    res.status(422)
    res.send({
      code: 42200,
      msg: statuses(422),
      detail: exception.constraints,
    })
  }
}
