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
          dbName: configService.getOrThrow("POSTGRE_NAME"),
          host: configService.getOrThrow("POSTGRE_HOST"),
          port: Number.parseInt(configService.getOrThrow("POSTGRE_PORT")) || 5432,
          user: configService.getOrThrow("POSTGRE_USER"),
          password: configService.getOrThrow("POSTGRE_PASSWORD"),
        }) as MikroOrmModuleSyncOptions;
        return config;
      },
    }),
  ],
})
export class DbModule {}
