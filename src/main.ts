import fastifyCookie from "@fastify/cookie";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { IdService } from "./global/id/id.service";

async function bootstrap() {
  let idService: IdService;
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      genReqId: () => idService.genSnowflakeId(),
      disableRequestLogging: true,
    }),
    {
      bufferLogs: true,
    },
  );
  const fastifyInstance: any = app.getHttpAdapter().getInstance();
  fastifyInstance.addHook(
    "preHandler",
    (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
      // HACK: 把 Reply 挂到 Request 上
      req.replyRef = reply;
      // 把 LogID 挂到响应头上
      reply.header("x-log-id", req.id);
      done();
    },
  );

  const logger = app.get(Logger);
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  idService = app.get(IdService);

  // 注册cookie插件
  await app.register(fastifyCookie as any, {
    secret: configService.getOrThrow("COOKIE_SECRET") as string,
  });

  const isProd = configService.get("IS_PRODUCTION", false);

  // NOTICE: Docker环境下需要监听0.0.0.0，其余场景可以是127.0.0.1
  const portStr = configService.get("APP_PORT", "8080");
  const host = configService.get("APP_HOST", "0.0.0.0");
  await app.listen(Number.parseInt(portStr), host);
  logger.log({ isProd }, `Server running in http://${host}:${portStr}`, "NestApp");
}

bootstrap();
