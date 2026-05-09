import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import statuses from "statuses";

@Catch(Error)
export class DefaultFilter<T extends Error> implements ExceptionFilter {
	private readonly logger = new Logger(DefaultFilter.name);

	constructor(private readonly configService: ConfigService) {}

	catch(exception: T, host: ArgumentsHost) {
		const req = host.switchToHttp().getRequest<FastifyRequest>();
		const res = host.switchToHttp().getResponse<FastifyReply>();

		// 记录详细的错误信息
		this.logger.error(exception, "unhandle exception");

		// 检查是否为开发环境
		const nodeEnv = this.configService.get<string>("NODE_ENV");
		const isDevelop = nodeEnv === "development";

		// 构建响应
		const response: Record<string, unknown> = {
			code: 50000,
			msg: statuses(HttpStatus.INTERNAL_SERVER_ERROR),
			logId: req.id,
		};

		// 开发环境下返回原始错误信息
		if (isDevelop) {
			response.originalError = {
				name: exception.name,
				message: exception.message,
				stack: exception.stack,
			};
		}

		// 设置响应头和状态码
		res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		res.send(response);
	}
}
