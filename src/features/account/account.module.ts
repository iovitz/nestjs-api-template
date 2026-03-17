import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { ConfigModule } from "@nestjs/config";

@Module({
	controllers: [AccountController],
	providers: [AccountService],
	imports: [ConfigModule],
})
export class AccountModule {}
