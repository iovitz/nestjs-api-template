import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Knex, { Knex as KnexInstance } from "knex";

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DbService.name);
	private _client: KnexInstance | null = null;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		const connectionString =
			this.configService.getOrThrow<string>("DATABASE_URL");
		this._client = Knex({
			client: "pg",
			connection: connectionString,
			pool: {
				min: 0,
				max: 10,
				idleTimeoutMillis: 30000,
				acquireTimeoutMillis: 2000,
			},
		});
		this.logger.log("Knex initialized");
	}

	async onModuleDestroy() {
		if (this._client) {
			await this._client.destroy();
			this.logger.log("Knex destroyed");
		}
	}

	get client() {
		if (!this._client) {
			throw new Error("Database not initialized");
		}
		return this._client;
	}
}
