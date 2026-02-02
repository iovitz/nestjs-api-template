import { Test } from "@nestjs/testing";
import { AppModule } from "./../src/app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { REDIS_CLIENT, closeRedis } from "../src/global/redis/redis.module";

describe("AppController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/GET health`, async () => {
    const resp = await app.inject({
      method: "GET",
      url: "/api/health",
    });
    expect(resp.statusCode).toEqual(200);
  });

  afterAll(async () => {
    const redis = app.get(REDIS_CLIENT);
    await redis.quit();
    redis.disconnect();
    await app.close();
  });
});
