import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/global/db/entities/user.entity";
import { IdService } from "src/global/id/id.service";
import { REDIS_CLIENT } from "src/global/redis/redis.module";
import * as argon2 from "argon2";

// Mock argon2
jest.mock("argon2", () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

// Mock es-toolkit omit
jest.mock("es-toolkit", () => ({
  omit: jest.fn((obj, keys) => {
    const result = { ...obj };
    keys.forEach((key: string) => delete result[key]);
    return result;
  }),
}));

describe("UserService", () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockEntityManager = {
    persistAndFlush: jest.fn(),
  };

  const mockIdService = {
    genPrimaryKey: jest.fn(),
    genSnowflakeId: jest.fn(),
  };

  const mockRedisClient = {
    setex: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockUser = {
    id: "test-id-123",
    name: "testuser",
    email: "test@example.com",
    password: "hashed-password",
    status: 0,
    lastLoginAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: IdService,
          useValue: mockIdService,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("register", () => {
    const registerDto = {
      name: "testuser",
      email: "test@example.com",
      password: "password123",
      code: "123456",
    };

    it("should throw ConflictException if email already exists", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow("邮箱已被注册");
    });

    it("should successfully register a new user", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockIdService.genPrimaryKey.mockReturnValue("new-id-123");
      (argon2.hash as jest.Mock).mockResolvedValue("hashed-password");
      mockUserRepository.create.mockReturnValue({ ...mockUser, id: "new-id-123" });
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: registerDto.email });
      expect(argon2.hash).toHaveBeenCalledWith(registerDto.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result).not.toHaveProperty("password");
    });

    it("should not expose password in returned user data", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockIdService.genPrimaryKey.mockReturnValue("new-id-123");
      (argon2.hash as jest.Mock).mockResolvedValue("hashed-password");
      mockUserRepository.create.mockReturnValue({ ...mockUser, id: "new-id-123" });
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).not.toHaveProperty("password");
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
      code: "123456",
    };

    it("should throw UnauthorizedException if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow("邮箱或密码错误");
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow("邮箱或密码错误");
    });

    it("should throw UnauthorizedException if user status is not 0", async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, status: 2 });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow("账号状态异常");
    });

    it("should successfully login and return user with sessionId", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockIdService.genSnowflakeId.mockReturnValue("session-123");
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);
      mockRedisClient.setex.mockResolvedValue("OK");

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("sessionId");
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        "session:session-123",
        86400,
        expect.any(String),
      );
    });

    it("should update lastLoginAt on successful login", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockIdService.genSnowflakeId.mockReturnValue("session-123");
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);
      mockRedisClient.setex.mockResolvedValue("OK");

      await service.login(loginDto);

      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(NotFoundException);
      await expect(service.findById("non-existent-id")).rejects.toThrow("用户不存在");
    });

    it("should return sanitized user data", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById("test-id-123");

      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("createdAt");
    });
  });

  describe("findByEmail", () => {
    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("notfound@example.com");

      expect(result).toBeNull();
    });

    it("should return sanitized user data if user found", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("getSessionData", () => {
    it("should return null if session not found", async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.getSessionData("session-123");

      expect(result).toBeNull();
    });

    it("should return parsed session data", async () => {
      const sessionData = { userId: "user-123", email: "test@example.com" };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(sessionData));

      const result = await service.getSessionData("session-123");

      expect(result).toEqual(sessionData);
    });

    it("should return null if JSON parse fails", async () => {
      mockRedisClient.get.mockResolvedValue("invalid-json");

      const result = await service.getSessionData("session-123");

      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("should delete session from Redis", async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.logout("session-123");

      expect(mockRedisClient.del).toHaveBeenCalledWith("session:session-123");
      expect(result).toBe(true);
    });

    it("should return true even if session does not exist", async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await service.logout("non-existent-session");

      expect(result).toBe(true);
    });
  });
});
