import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { AccountModule } from "./account/account.module";

@Module({
	imports: [HealthModule, AccountModule],
})
export class FeaturesModule {}
