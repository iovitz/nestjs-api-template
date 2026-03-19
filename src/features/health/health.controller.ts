import { Controller, Get, Inject } from "@nestjs/common";
import {
	HealthCheck,
	HealthCheckService,
	HealthCheckResult,
	HealthIndicatorService,
	HealthIndicatorResult,
	PrismaHealthIndicator,
} from "@nestjs/terminus";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/global/redis/redis.module";
import { DbService } from "src/global/db/db.service";

@Controller("api/health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly healthIndicator: HealthIndicatorService,
		private readonly prismaHealth: PrismaHealthIndicator,
		@Inject(REDIS_CLIENT) private readonly redis: Redis,
		private readonly db: DbService,
	) {}

	@Get()
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.checkMemory(),
			() => this.prismaHealth.pingCheck("database", this.db),
			() => this.checkRedis(),
		]);
	}

	private async checkMemory(): Promise<HealthIndicatorResult> {
		const usage = process.memoryUsage();
		const heapUsed = usage.heapUsed;
		const rss = usage.rss;
		const heapThreshold = 300 * 1024 * 1024;
		const rssThreshold = 300 * 1024 * 1024;

		const heapOk = heapUsed < heapThreshold;
		const rssOk = rss < rssThreshold;

		return {
			memory: {
				status: heapOk && rssOk ? "up" : "down",
				heapUsed: `${Math.round(heapUsed / 1024 / 1024)}MB`,
				heapThreshold: `${Math.round(heapThreshold / 1024 / 1024)}MB`,
				rss: `${Math.round(rss / 1024 / 1024)}MB`,
				rssThreshold: `${Math.round(rssThreshold / 1024 / 1024)}MB`,
			},
		};
	}

	private async checkRedis(): Promise<HealthIndicatorResult> {
		try {
			const result = await this.redis.ping();
			const isHealthy = result === "PONG";

			if (isHealthy) {
				return this.healthIndicator.check("redis").up("Redis is connected");
			}
			return this.healthIndicator.check("redis").down("Redis ping failed");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Redis connection failed";
			return this.healthIndicator.check("redis").down(message);
		}
	}
}
