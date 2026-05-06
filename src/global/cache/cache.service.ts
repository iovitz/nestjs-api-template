import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { DbService } from "../db/db.service";

export interface CacheOptions {
	ttlSeconds?: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(CacheService.name);
	private readonly tableName = "cache";
	private readonly cleanupInterval = 60_000; // 1 minute
	private cleanupTimer: ReturnType<typeof setInterval> | null = null;

	constructor(private readonly dbService: DbService) {}

	async onModuleInit() {
		await this.ensureTableExists();
		this.startCleanupTimer();
		this.logger.log(`CacheService initialized with table: ${this.tableName}`);
	}

	async onModuleDestroy() {
		this.stopCleanupTimer();
	}

	/**
	 * Get value by key
	 */
	async get<T = unknown>(key: string): Promise<T | null> {
		const result = await this.dbService.client
			.table(this.tableName)
			.where("key", key)
			.where((builder) => {
				void builder
					.whereNull("expires_at")
					.orWhere("expires_at", ">", new Date());
			})
			.first<{ value: T }>();

		return result?.value ?? null;
	}

	/**
	 * Set value with optional TTL
	 */
	async set<T = unknown>(
		key: string,
		value: T,
		options?: CacheOptions,
	): Promise<void> {
		const expiresAt = options?.ttlSeconds
			? new Date(Date.now() + options.ttlSeconds * 1000)
			: null;

		await this.dbService.client
			.table(this.tableName)
			.insert({
				key,
				value,
				expires_at: expiresAt,
			})
			.onConflict("key")
			.merge(["value", "expires_at"]);
	}

	/**
	 * Set value with TTL in seconds (alias)
	 */
	async setex<T = unknown>(
		key: string,
		ttlSeconds: number,
		value: T,
	): Promise<void> {
		await this.set(key, value, { ttlSeconds });
	}

	/**
	 * Delete key
	 */
	async del(key: string): Promise<void> {
		await this.dbService.client
			.table(this.tableName)
			.where("key", key)
			.delete();
	}

	/**
	 * Delete multiple keys by pattern
	 */
	async delByPattern(pattern: string): Promise<void> {
		const likePattern = pattern.replace(/\*/g, "%").replace(/\?/g, "_");

		await this.dbService.client
			.table(this.tableName)
			.where("key", "LIKE", likePattern)
			.delete();
	}

	/**
	 * Check if key exists
	 */
	async exists(key: string): Promise<boolean> {
		const result = await this.dbService.client
			.table(this.tableName)
			.where("key", key)
			.where((builder) => {
				void builder
					.whereNull("expires_at")
					.orWhere("expires_at", ">", new Date());
			})
			.first();

		return !!result;
	}

	/**
	 * Clean up expired entries
	 */
	async cleanup(): Promise<number> {
		const result = await this.dbService.client
			.table(this.tableName)
			.where("expires_at", "<", new Date())
			.delete();

		if (result) {
			this.logger.debug(`Cleaned up ${result} expired cache entries`);
		}

		return result ?? 0;
	}

	private async ensureTableExists(): Promise<void> {
		const exists = await this.dbService.client.raw(
			`SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_name = '${this.tableName}'
			)`,
		);

		if (!exists.rows?.[0]?.exists) {
			await this.dbService.client.raw(`
				CREATE UNLOGGED TABLE IF NOT EXISTS ${this.tableName} (
					key TEXT PRIMARY KEY,
					value JSONB NOT NULL,
					expires_at TIMESTAMPTZ DEFAULT NULL
				)
			`);

			await this.dbService.client.raw(`
				CREATE INDEX IF NOT EXISTS idx_${this.tableName}_expires 
				ON ${this.tableName} (expires_at) WHERE expires_at IS NOT NULL
			`);

			this.logger.log(`Created UNLOGGED table: ${this.tableName}`);
		} else {
			await this.dbService.client.raw(
				`ALTER TABLE ${this.tableName} SET UNLOGGED`,
			);
		}
	}

	private startCleanupTimer(): void {
		this.cleanupTimer = setInterval(() => {
			this.cleanup().catch((err) => {
				this.logger.error("Cache cleanup failed", err);
			});
		}, this.cleanupInterval);
	}

	private stopCleanupTimer(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = null;
		}
	}
}
