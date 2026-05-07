import type { Knex } from "knex";
import { config } from "dotenv";

config();

const commonConfig: Knex.Config = {
	client: "pg",
	pool: {
		min: 0,
		max: 10,
		idleTimeoutMillis: 30000,
		acquireTimeoutMillis: 2000,
	},
	migrations: {
		directory: "./src/global/db/knex-migrations",
		extension: "ts",
		tableName: "knex_migrations",
	},
	seeds: {
		directory: "./src/global/db/knex-seeds",
		extension: "ts",
	},
};

const configMap: Record<string, Knex.Config> = {
	development: {
		...commonConfig,
		connection: process.env.DATABASE_URL,
		debug: true,
	},
	staging: {
		...commonConfig,
		connection: process.env.DATABASE_URL,
	},
	production: {
		...commonConfig,
		connection: process.env.DATABASE_URL,
	},
};

export default configMap;
