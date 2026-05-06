import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const account = pgTable("account", {
	id: varchar("id", { length: 255 }).primaryKey(),
	name: varchar("name", { length: 10 }).notNull(),
	email: varchar("email", { length: 32 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	status: integer("status").default(0).notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: "date" }),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
