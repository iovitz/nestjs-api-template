import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import Redis from "ioredis";
import { UserController } from "../src/features/user/user.controller";
import { UserService } from "../src/features/user/user.service";
import { HttpContextService } from "../src/global/http-context/http-context.service";
import { AuthGuard } from "../src/aspects/guards/auth.guard";
import { REDIS_CLIENT } from "../src/global/redis/redis.module";

describe("User (e2e)", () => {
  let app: NestFastifyApplication;
  let mockUserService: jest.Mocked<UserService>;
  let mockHttpContextService: jest.Mocked<HttpContextService>;
  let mockRedis: jest.Mocked<Redis>;

  beforeAll(async () => {
    mockUserService = {
      register: jest
        .fn()
        .mockResolvedValue({ id: "1", name: "testuser", email: "test@example.com" }),
      login: jest.fn().mockResolvedValue({
        user: { id: "1", name: "testuser", email: "test@example.com" },
        sessionId: "test-session-id",
      }),
      findById: jest
        .fn()
        .mockResolvedValue({ id: "1", name: "testuser", email: "test@example.com" }),
      getSessionData: jest
        .fn()
        .mockResolvedValue({ userId: "1", email: "test@example.com", name: "testuser" }),
      logout: jest.fn().mockResolvedValue(true),
    } as any;

    mockHttpContextService = {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
      getCookie: jest.fn().mockReturnValue(""),
    } as any;

    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue("OK"),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue("OK"),
      disconnect: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: HttpContextService, useValue: mockHttpContextService },
        AuthGuard,
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  describe("POST /api/user/register", () => {
    it("should register a new user and return 201", async () => {
      const resp = await app.inject({
        method: "POST",
        url: "/api/user/register",
        payload: {
          name: "testuser",
          email: "test@example.com",
          password: "password123",
          code: "1234",
        },
      });
      expect(resp.statusCode).toEqual(201);
      expect(mockUserService.register).toHaveBeenCalled();
    });
  });

  describe("POST /api/user/login", () => {
    it("should login successfully and return 200", async () => {
      const resp = await app.inject({
        method: "POST",
        url: "/api/user/login",
        payload: {
          email: "test@example.com",
          password: "password123",
          code: "1234",
        },
      });
      expect(resp.statusCode).toEqual(200);
      expect(mockHttpContextService.setCookie).toHaveBeenCalledWith("session", "test-session-id");
    });
  });

  describe("GET /api/user/profile", () => {
    it("should return 401 without auth guard", async () => {
      const resp = await app.inject({
        method: "GET",
        url: "/api/user/profile",
      });
      expect(resp.statusCode).toEqual(401);
    });
  });

  describe("POST /api/user/logout", () => {
    it("should return 401 without auth guard", async () => {
      const resp = await app.inject({
        method: "POST",
        url: "/api/user/logout",
      });
      expect(resp.statusCode).toEqual(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
