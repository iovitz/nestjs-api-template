import { MikroOrmModule, MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import getMikroORMConfig from "src/mikro-orm.config";

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      driver: PostgreSqlDriver as any,
      useFactory: (configService: ConfigService) => {
        const config = getMikroORMConfig("default", {
          dbName: configService.getOrThrow("DB_NAME"),
          host: configService.getOrThrow("DB_HOST"),
          port: Number.parseInt(configService.getOrThrow("DB_PORT")) || 5432,
          user: configService.getOrThrow("DB_USER"),
          password: configService.getOrThrow("DB_PASSWORD"),
        }) as MikroOrmModuleSyncOptions;
        return config;
      },
    }),
  ],
})
export class DbModule {}
