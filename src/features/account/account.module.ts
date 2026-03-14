import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Account } from "src/global/db/entities/account.entity";
import { ConfigModule } from "@nestjs/config";

@Module({
	controllers: [AccountController],
	providers: [AccountService],
	imports: [MikroOrmModule.forFeature([Account]), ConfigModule],
})
export class AccountModule {}
