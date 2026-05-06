import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { HttpContextService } from "src/global/http-context/http-context.service";
import { CacheService } from "src/global/cache/cache.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly cacheService: CacheService,
		private readonly httpContextService: HttpContextService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<FastifyRequest>();
		const sessionId = this.httpContextService.getCookie("session");

		if (!sessionId) {
			throw new UnauthorizedException("请先登录");
		}

		// 从Cache获取session数据
		const key = `session:${sessionId}`;
		const sessionData = await this.cacheService.get<{
			id: string;
			email?: string;
			name?: string;
			loginAt?: string;
		}>(key);

		if (!sessionData) {
			this.httpContextService.clearCookie("session");
			throw new UnauthorizedException("会话已过期，请重新登录");
		}

		if (!sessionData.id) {
			throw new UnauthorizedException("会话数据无效");
		}

		// 将用户信息附加到请求对象上，供后续使用
		request.account = {
			id: sessionData.id,
			session: sessionId,
		};

		return true;
	}
}
