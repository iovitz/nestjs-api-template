import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
	SetMetadata,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Readable } from "node:stream";

export const SKIP_RESPONSE_FORMAT_KEY = Symbol("SKIP_RESPONSE_FORMAT_KEY");

export function SkipFormat() {
	return SetMetadata(SKIP_RESPONSE_FORMAT_KEY, true);
}

@Injectable()
export class FormatterInterceptor implements NestInterceptor {
	private readonly logger = new Logger(FormatterInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const handler = context.getHandler();
		const reply = context.switchToHttp().getResponse<FastifyReply>();
		const skipFormat = Reflect.getMetadata(SKIP_RESPONSE_FORMAT_KEY, handler);
		return next.handle().pipe(
			map((data) => {
				if (
					skipFormat ||
					reply.sent ||
					reply.raw.headersSent ||
					data instanceof Readable
				) {
					this.logger.log("Skip Response Format");
					return data;
				}

				return {
					data,
					code: 0,
					msg: "success",
				};
			}),
		);
	}
}
