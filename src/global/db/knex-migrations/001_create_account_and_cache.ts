import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	// Account table schema
	await knex.schema.createTable("account", (table) => {
		table.string("id", 255).primary();
		table.string("name", 10).notNullable();
		table.string("email", 32).notNullable().unique();
		table.string("password", 255).notNullable();
		table.integer("status").defaultTo(0).notNullable();
		table.timestamp("last_login_at");
		table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
		table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
	});

	// Index for email lookup
	await knex.schema.raw(
		"CREATE INDEX IF NOT EXISTS idx_account_email ON account(email)",
	);

	// Index for status filter
	await knex.schema.raw(
		"CREATE INDEX IF NOT EXISTS idx_account_status ON account(status)",
	);

	// UNLOGGED table for cache (no WAL, faster writes, no durability needed)
	await knex.schema.raw(`
		CREATE UNLOGGED TABLE IF NOT EXISTS cache (
			key TEXT PRIMARY KEY,
			value JSONB NOT NULL,
			expires_at TIMESTAMPTZ DEFAULT NULL
		)
	`);

	// Index for expiration cleanup
	await knex.schema.raw(`
		CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache (expires_at)
		WHERE expires_at IS NOT NULL
	`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists("cache");
	await knex.schema.dropTableIfExists("account");
}
