import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "./prisma-client/client";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class DbService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger(DbService.name);

	constructor(readonly _configService: ConfigService) {
		super({
			adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
			log: [
				{ emit: "event", level: "query" },
				{ emit: "event", level: "info" },
				{ emit: "event", level: "warn" },
				{ emit: "event", level: "error" },
			],
		});

		super.$on("info" as never, (e: any) => {
			this.logger.verbose(e.query);
		});
	}
	async onModuleInit() {
		await this.$connect();
		this.logger.log("Connected to database!!!");
	}
}
