import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { AccountModule } from "./account/account.module";
import { SecurityModule } from "./security/security.module";
import { SamplesModule } from "./samples/samples.module";

@Module({
	imports: [HealthModule, AccountModule, SecurityModule, SamplesModule],
})
export class FeaturesModule {}
