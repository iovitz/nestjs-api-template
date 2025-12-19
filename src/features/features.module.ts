import { Module } from "@nestjs/common";
import { BookModule } from "./book/book.module";
import { HealthModule } from "./health/health.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [HealthModule, UserModule, BookModule],
})
export class FeaturesModule {}
