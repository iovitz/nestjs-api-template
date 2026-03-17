import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { omit } from "es-toolkit";
import Redis from "ioredis";
import { DbService } from "src/global/db/db.service";
import type { Account } from "src/global/db/prisma-client/client";
import { IdService } from "src/global/id/id.service";
import { REDIS_CLIENT } from "src/global/redis/redis.module";
import { LoginDto, RegisterDto } from "./account.dto";
import { CryptoService } from "src/global/crypto/crypto.service";

@Injectable()
export class AccountService {
	constructor(
		private readonly db: DbService,
		private readonly cryptoService: CryptoService,
		private readonly idService: IdService,
		@Inject(REDIS_CLIENT) private readonly redisClient: Redis,
	) {}

	async register({ name, email, password }: RegisterDto) {
		// TODO 校验验证码

		// 检查邮箱是否已存在
		const existingAccount = await this.db.account.findUnique({ where: { email } });
		if (existingAccount) {
			throw new ConflictException("邮箱已被注册");
		}

		// 加密密码
		const hashedPassword = await this.cryptoService.hashPassword(password);

		// 创建用户
		const account = await this.db.account.create({
			data: {
				id: this.idService.genPrimaryKey(),
				name,
				email,
				password: hashedPassword,
				status: 0, // 正常状态
			},
		});

		// 返回用户信息（不包含密码）
		return this.sanitizeAccountData(account);
	}

	async login({ email, password }: LoginDto) {
		// TODO 校验验证码

		// 查找用户
		const account = await this.db.account.findUnique({ where: { email } });
		if (!account) {
			throw new UnauthorizedException("邮箱或密码错误");
		}

		// 验证密码
		const isPasswordValid = await this.cryptoService.verifyPassword(
			account.password,
			password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException("邮箱或密码错误");
		}

		// 检查用户状态
		if (account.status !== 0) {
			throw new UnauthorizedException("账号状态异常");
		}

		// 更新最后登录时间
		await this.db.account.update({
			where: { id: account.id },
			data: { lastLoginAt: new Date() },
		});

		// 生成session并写入Redis
		const sessionId = this.generateSessionId();
		const sessionData = {
			id: account.id,
			email: account.email,
			name: account.name,
			loginAt: new Date().toISOString(),
		};

		// 将session写入Redis，设置24小时过期时间
		await this.redisClient.setex(
			`session:${sessionId}`,
			86400,
			JSON.stringify(sessionData),
		);

		// 返回用户数据和sessionId
		return {
			account: this.sanitizeAccountData(account),
			sessionId,
		};
	}

	async findById(id: string) {
		const account = await this.db.account.findUnique({ where: { id } });
		if (!account) {
			throw new NotFoundException("用户不存在");
		}

		return this.sanitizeAccountData(account);
	}

	async findByEmail(email: string) {
		const account = await this.db.account.findUnique({ where: { email } });
		if (!account) {
			return null;
		}

		return this.sanitizeAccountData(account);
	}

	sanitizeAccountData(account: Account) {
		return omit(account, ["password", "createdAt", "updatedAt", "lastLoginAt", "status"]);
	}

	/**
	 * 获取session数据
	 */
	async getSessionData(sessionId: string) {
		const key = `session:${sessionId}`;
		const data = await this.redisClient.get(key);
		if (!data) return null;

		try {
			return JSON.parse(data);
		} catch {
			return null;
		}
	}

	/**
	 * 用户登出
	 */
	async logout(sessionId: string) {
		const key = `session:${sessionId}`;

		// 删除Redis中的session数据
		await this.redisClient.del(key);

		return true;
	}

	/**
	 * 生成session ID
	 */
	private generateSessionId(): string {
		return this.idService.genSnowflakeId();
	}
}
