import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { AccountModule } from "./account/account.module";
import { VerifyModule } from "./verify/verify.module";

@Module({
	imports: [HealthModule, AccountModule, VerifyModule],
})
export class FeaturesModule {}
