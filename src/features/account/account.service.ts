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
import { Account } from "src/global/db/types/account";
import { IdService } from "src/global/id/id.service";
import { REDIS_CLIENT } from "src/global/redis/redis.module";
import { CryptoService } from "src/global/crypto/crypto.service";
import { LoginDto, RegisterDto } from "./account.dto";

@Injectable()
export class AccountService {
	private readonly tableName = "account";

	constructor(
		private readonly db: DbService,
		private readonly cryptoService: CryptoService,
		private readonly idService: IdService,
		@Inject(REDIS_CLIENT) private readonly redisClient: Redis,
	) {}

	async register({ name, email, password }: RegisterDto) {
		// TODO: 校验验证码

		// 检查邮箱是否已存在
		const table = this.db.client(this.tableName);
		const existingAccount = await table.where("email", email).first();

		if (existingAccount) {
			throw new ConflictException("邮箱已被注册");
		}

		// 加密密码
		const hashedPassword = await this.cryptoService.hashPassword(password);

		// 创建用户
		const now = new Date();
		const [newAccount] = await table
			.insert({
				id: this.idService.genPrimaryKey(),
				name,
				email,
				password: hashedPassword,
				status: 0, // 正常状态
				created_at: now,
				updated_at: now,
			})
			.returning("*");

		// 返回用户信息（不包含密码）
		return this.sanitizeAccountData(newAccount);
	}

	async login({ email, password }: LoginDto) {
		// TODO: 校验验证码

		// 查找用户
		const table = this.db.client(this.tableName);
		const accountData = await table.where("email", email).first();

		if (!accountData) {
			throw new UnauthorizedException("邮箱或密码错误");
		}

		// 验证密码
		const isPasswordValid = await this.cryptoService.verifyPassword(
			accountData.password,
			password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException("邮箱或密码错误");
		}

		// 检查用户状态
		if (accountData.status !== 0) {
			throw new UnauthorizedException("账号状态异常");
		}

		// 更新最后登录时间
		await table.where("id", accountData.id).update({
			last_login_at: new Date(),
		});

		// 生成session并写入Redis
		const sessionId = this.generateSessionId();
		const sessionData = {
			id: accountData.id,
			email: accountData.email,
			name: accountData.name,
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
			account: this.sanitizeAccountData(accountData),
			sessionId,
		};
	}

	async findById(id: string) {
		const table = this.db.client(this.tableName);
		const accountData = await table.where("id", id).first();

		if (!accountData) {
			throw new NotFoundException("用户不存在");
		}

		return this.sanitizeAccountData(accountData);
	}

	async findByEmail(email: string) {
		const table = this.db.client(this.tableName);
		const accountData = await table.where("email", email).first();

		if (!accountData) {
			return null;
		}

		return this.sanitizeAccountData(accountData);
	}

	sanitizeAccountData(accountData: Account) {
		return omit(accountData, [
			"password",
			"created_at",
			"updated_at",
			"last_login_at",
			"status",
		]);
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
