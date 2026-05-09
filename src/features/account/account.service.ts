import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { omit } from "es-toolkit";
import { DbService } from "src/global/db/db.service";
import { Account } from "src/global/db/types/account";
import { IdService } from "src/global/id/id.service";
import { CacheService } from "src/global/cache/cache.service";
import { CryptoService } from "src/global/crypto/crypto.service";
import { LoginDto, RegisterDto } from "./account.dto";

@Injectable()
export class AccountService {
	private readonly tableName = "account";
	private readonly logger = new Logger(AccountService.name);

	constructor(
		private readonly db: DbService,
		private readonly cryptoService: CryptoService,
		private readonly idService: IdService,
		private readonly cacheService: CacheService,
	) {}

	async register({ name, email, password }: RegisterDto) {
		// TODO: 校验验证码

		// 检查邮箱是否已存在
		const table = this.db.client(this.tableName);
		const existingAccount = await table.where("email", email).first();

		if (existingAccount) {
			this.logger.warn({ email }, "Registration failed: email already exists");
			throw new ConflictException("邮箱已被注册");
		}

		// 加密密码
		const hashedPassword = await this.cryptoService.hashPassword(password);

		const now = new Date();
		const [newAccount] = await table
			.insert({
				id: this.idService.genPrimaryKey(),
				name,
				email,
				password: hashedPassword,
				status: 0,
				created_at: now,
				updated_at: now,
			})
			.returning("*");

		this.logger.log(
			{ userId: newAccount.id, email },
			"User registered successfully",
		);

		return this.sanitizeAccountData(newAccount);
	}

	async login({ email, password }: LoginDto) {
		// TODO: 校验验证码

		// 查找用户
		const table = this.db.client(this.tableName);
		const accountData = await table.where("email", email).first();

		if (!accountData) {
			this.logger.warn({ email, reason: "account_not_found" }, "Login failed");
			throw new UnauthorizedException("邮箱或密码错误");
		}

		// 验证密码
		const isPasswordValid = await this.cryptoService.verifyPassword(
			accountData.password,
			password,
		);
		if (!isPasswordValid) {
			this.logger.warn({ email, reason: "invalid_password" }, "Login failed");
			throw new UnauthorizedException("邮箱或密码错误");
		}

		// 检查用户状态
		if (accountData.status !== 0) {
			this.logger.warn(
				{ userId: accountData.id, status: accountData.status },
				"Login failed: account status abnormal",
			);
			throw new UnauthorizedException("账号状态异常");
		}

		// 更新最后登录时间
		await table.where("id", accountData.id).update({
			last_login_at: new Date(),
		});

		// 生成session并写入Cache
		const sessionId = this.generateSessionId();
		const sessionData = {
			id: accountData.id,
			email: accountData.email,
			name: accountData.name,
			loginAt: new Date().toISOString(),
		};

		// 将session写入Cache，设置24小时过期时间
		await this.cacheService.setex(`session:${sessionId}`, 86400, sessionData);

		this.logger.log(
			{ userId: accountData.id, sessionId },
			"User login successful",
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

	async getSessionData(sessionId: string) {
		const key = `session:${sessionId}`;
		const data = await this.cacheService.get<{
			id: string;
			email: string;
			name: string;
			loginAt: string;
		}>(key);

		if (!data) {
			this.logger.debug({ sessionId }, "Session not found or expired");
		}

		return data;
	}

	async logout(sessionId: string) {
		const key = `session:${sessionId}`;

		// 删除Cache中的session数据
		await this.cacheService.del(key);

		this.logger.log({ sessionId }, "User logout successful");

		return true;
	}

	/**
	 * 生成session ID
	 */
	private generateSessionId(): string {
		return this.idService.genSnowflakeId();
	}
}
