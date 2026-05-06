import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/account";

@Injectable()
export class DbService implements OnModuleInit {
	private readonly logger = new Logger(DbService.name);
	private _client: ReturnType<typeof drizzle> | null = null;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		const connectionString =
			this.configService.getOrThrow<string>("DATABASE_URL");
		const { Pool } = pg;
		const pool = new Pool({
			connectionString,
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});
		this._client = drizzle(pool, { schema });
		this.logger.log("Drizzle ORM initialized");
	}

	get client() {
		if (!this._client) {
			throw new Error("Database not initialized");
		}
		return this._client;
	}
}

export { account, type Account, type NewAccount } from "./schema/account";
