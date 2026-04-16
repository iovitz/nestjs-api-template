import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./global/db/prisma-client/client";

// 创建独立的 PrismaClient 实例
const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const betterAuthInstance = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	socialProviders: {
		// github: {
		//   clientId: process.env.GITHUB_CLIENT_ID!,
		//   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		// },
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	trustedOrigins: ["http://localhost:9876"],
});
