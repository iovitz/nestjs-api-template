import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	await knex("account").del();
	await knex("account").insert([
		{
			id: "admin_001",
			name: "admin",
			email: "admin@example.com",
			password: "$argon2i$v=19$m=65536,t=3,p=4$placeholder",
			status: 1,
		},
		{
			id: "user_001",
			name: "test",
			email: "test@example.com",
			password: "$argon2i$v=19$m=65536,t=3,p=4$placeholder",
			status: 0,
		},
	]);
}
