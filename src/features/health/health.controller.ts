import { Controller, Get } from "@nestjs/common";
import {
	HealthCheck,
	HealthCheckService,
	HealthCheckResult,
	HealthIndicatorService,
	HealthIndicatorResult,
} from "@nestjs/terminus";
import { DbService } from "src/global/db/db.service";

@Controller("api/health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly healthIndicator: HealthIndicatorService,
		private readonly db: DbService,
	) {}

	@Get()
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.checkMemory(),
			() => this.checkDatabase(),
			() => this.checkCache(),
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

	private async checkDatabase(): Promise<HealthIndicatorResult> {
		try {
			const result = await this.db.client.raw("SELECT 1");
			if (result && (result as { rowCount?: number }).rowCount !== undefined) {
				return this.healthIndicator
					.check("database")
					.up("Database is connected");
			}
			return this.healthIndicator
				.check("database")
				.down("Database query failed");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Database connection failed";
			return this.healthIndicator.check("database").down(message);
		}
	}

	private async checkCache(): Promise<HealthIndicatorResult> {
		try {
			const result = await this.db.client.raw(
				`SELECT EXISTS (
					SELECT FROM information_schema.tables 
					WHERE table_name = 'cache'
				)`,
			);

			if (result.rows?.[0]?.exists) {
				return this.healthIndicator.check("cache").up("Cache is connected");
			}
			return this.healthIndicator.check("cache").down("Cache table not found");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Cache connection failed";
			return this.healthIndicator.check("cache").down(message);
		}
	}
}
