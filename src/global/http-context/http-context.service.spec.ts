import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { HttpContextService } from "./http-context.service";

describe("HttpContextService", () => {
  let service: HttpContextService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRequest = {
    replyRef: {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
      header: jest.fn(),
    },
    cookies: {},
    headers: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpContextService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = await module.resolve(HttpContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
