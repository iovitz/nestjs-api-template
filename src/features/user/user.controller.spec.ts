import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { HttpContextService } from "src/global/http-context/http-context.service";
import { AuthGuard } from "src/aspects/guards/auth.guard";

describe("UserController", () => {
  let controller: UserController;
  let userService: UserService;

  const mockHttpContextService = {
    setCookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  const sanitizedUser = {
    id: "test-id-123",
    name: "testuser",
    email: "test@example.com",
    status: 0,
    lastLoginAt: new Date(),
  };

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    getSessionData: jest.fn(),
    findById: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: HttpContextService,
          useValue: mockHttpContextService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    const registerDto = {
      name: "testuser",
      email: "test@example.com",
      password: "password123",
      code: "123456",
    };

    it("should register a new user and return user data", async () => {
      const mockCreatedUser = { ...sanitizedUser };
      mockUserService.register.mockResolvedValue(mockCreatedUser);

      const result = await controller.register(registerDto);

      expect(userService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
      code: "123456",
    };

    it("should login user and set session cookie", async () => {
      const loginResult = {
        user: sanitizedUser,
        sessionId: "session-123",
      };
      mockUserService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(userService.login).toHaveBeenCalledWith(loginDto);
      expect(mockHttpContextService.setCookie).toHaveBeenCalledWith("session", "session-123");
      expect(result).toEqual(sanitizedUser);
    });
  });

  describe("getProfile", () => {
    it("should return user profile for authenticated user", async () => {
      const currentUser = { id: "test-id-123", session: "session-123" };
      const sessionData = { userId: "test-id-123", email: "test@example.com" };

      mockUserService.getSessionData.mockResolvedValue(sessionData);
      mockUserService.findById.mockResolvedValue(sanitizedUser);

      const result = await controller.getProfile(currentUser);

      expect(userService.getSessionData).toHaveBeenCalledWith(currentUser.session);
      expect(userService.findById).toHaveBeenCalledWith(sessionData.userId);
      expect(result).toEqual(sanitizedUser);
    });

    it("should throw error if session expired", async () => {
      const currentUser = { id: "test-id-123", session: "session-123" };

      mockUserService.getSessionData.mockResolvedValue(null);

      await expect(controller.getProfile(currentUser)).rejects.toThrow("会话已过期");
    });
  });

  describe("logout", () => {
    it("should logout user and clear session cookie", async () => {
      const currentUser = { id: "test-id-123", session: "session-123" };

      mockUserService.logout.mockResolvedValue(true);

      await expect(controller.logout(currentUser)).rejects.toThrow(UnauthorizedException);

      expect(userService.logout).toHaveBeenCalledWith(currentUser.session);
      expect(mockHttpContextService.clearCookie).toHaveBeenCalledWith("session");
    });
  });
});
