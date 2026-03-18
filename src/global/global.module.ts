import process from "node:process";
import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { Logger, LoggerModule, Params } from "nestjs-pino";
import pino from "pino";
import { CronjobService } from "./cronjob/cronjob.service";
import { HttpContextService } from "./http-context/http-context.service";
import { IdService } from "./id/id.service";
import { RedisModule } from "./redis/redis.module";
import { CryptoService } from "./crypto/crypto.service";
import { DbService } from "./db/db.service";

@Global()
@Module({
	imports: [
		HttpModule,
		ConfigModule.forRoot({
			isGlobal: true,
			load: [
				// load remote config
				async () => {
					const isProd = process.env.NODE_ENV === "prod";

					return {
						IS_PROD: isProd,
					};
				},
			],
		}),
		ScheduleModule.forRoot(),
		RedisModule.forRootAsync({
			useFactory: async (configService: ConfigService, logger: Logger) => {
				const url = configService.getOrThrow("REDIS_URL");
				logger.log(`Redis URL: ${url}`);
				return {
					url,
					enableOfflineQueue: true,
					maxRetriesPerRequest: 3,
				};
			},
			inject: [ConfigService, Logger],
		}),
		LoggerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				return {
					pinoHttp: {
						customReceivedObject(req) {
							return {
								msg: "request in",
								path: req.url,
								mathod: req.method,
							};
						},
						customSuccessObject(req, res, val) {
							return {
								path: req.url,
								mathod: req.method,
								status: res.statusCode,
								cost: val.responseTime,
							};
						},
						customErrorObject(req, res, _error, val) {
							return {
								path: req.url,
								mathod: req.method,
								status: res.statusCode,
								cost: val.responseTime,
							};
						},
						quietReqLogger: true,
						quietResLogger: true,
						level: config.get("LOG_LEVEL", "info"),
						transport:
							process.env.NODE_ENV === "production"
								? undefined
								: { target: "pino-pretty" },
						stream:
							process.env.NODE_ENV === "production"
								? pino.destination({
										dest: "./app.log",
										minLength: 4096,
										sync: false,
										append: true,
									})
								: void 0,
					},
				} as Params;
			},
		}),

		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				throttlers: [
					{
						name: "default",
						ttl: config.get("THROTTLE_TTL", 60000), // 60秒
						limit: config.get("THROTTLE_LIMIT", 60), // 100次请求
					},
					{
						name: "short",
						ttl: config.get("SHORT_THROTTLE_TTL", 20000),
						limit: config.get("SHORT_THROTTLE_LIMIT", 10),
					},
				],
			}),
		}),
	],
	providers: [
		IdService,
		CronjobService,
		HttpContextService,
		CryptoService,
		DbService,
	],
	exports: [IdService, HttpContextService, CryptoService, DbService],
})
export class GlobalModule {}
