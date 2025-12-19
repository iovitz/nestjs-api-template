import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Snowflake, TwitterSnowflake } from "@sapphire/snowflake";

@Injectable()
export class IdService {
  dbPKGenerator: Snowflake;

  constructor(private readonly configService: ConfigService) {
    const time = new Date(configService.get("SNOWFLAKE_EPOCH") ?? "2000-01-01T00:00:00.000Z");
    this.dbPKGenerator = new Snowflake(time);
  }

  genPrimaryKey() {
    return this.dbPKGenerator.generate().toString();
  }

  genSnowflakeId() {
    return TwitterSnowflake.generate().toString();
  }
}
