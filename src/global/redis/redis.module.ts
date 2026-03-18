import { DynamicModule, Module, Provider } from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";

export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

export interface RedisModuleOptions {
	url: string;
	enableOfflineQueue?: boolean;
	maxRetriesPerRequest?: number;
}

export interface RedisModuleAsyncOptions {
	useFactory: (
		...args: any[]
	) => Promise<RedisModuleOptions> | RedisModuleOptions;
	inject?: any[];
}

export interface RedisModuleOptionsProvider {
	createRedisOptions: () => Promise<RedisModuleOptions> | RedisModuleOptions;
}

// https://github.com/redis/ioredis
@Module({})
export class RedisModule {
	static forRoot(options: RedisModuleOptions): DynamicModule {
		const redisProvider: Provider = {
			provide: REDIS_CLIENT,
			useFactory: async () => {
				const redisUrl = new URL(options.url);
				const password = redisUrl.searchParams.get("password") ?? void 0;
				const db = parseInt(redisUrl.searchParams.get("db") || "0", 10);
				const port = parseInt(redisUrl.port || "6379", 10);
				const redisOptions: RedisOptions = {
					host: redisUrl.hostname,
					port,
					password,
					db,
					enableOfflineQueue: options.enableOfflineQueue,
					maxRetriesPerRequest: options.maxRetriesPerRequest || 3,
				};
				const redis = new Redis(redisOptions);
				await redis.connect();
				return redis;
			},
		};

		return {
			module: RedisModule,
			providers: [redisProvider],
			exports: [REDIS_CLIENT],
			global: true,
		};
	}

	static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
		return {
			module: RedisModule,
			providers: [
				{
					provide: REDIS_CLIENT,
					useFactory: async (...args: any[]) => {
						const redisModuleOptions = await options.useFactory(...args);
						const redisUrl = new URL(redisModuleOptions.url);
						const password = redisUrl.searchParams.get("password") ?? void 0;
						const db = parseInt(redisUrl.searchParams.get("db") || "0", 10);
						const port = parseInt(redisUrl.port || "6379", 10);
						const redisOptions: RedisOptions = {
							host: redisUrl.hostname,
							port,
							password,
							db,
							enableOfflineQueue: redisModuleOptions.enableOfflineQueue,
							maxRetriesPerRequest:
								redisModuleOptions.maxRetriesPerRequest || 3,
						};
						const redis = new Redis(redisOptions);

						await redis.ping();
						console.log("链接成功");
						return redis;
					},
					inject: options.inject || [],
				},
			],
			exports: [REDIS_CLIENT],
			global: true,
		};
	}
}
