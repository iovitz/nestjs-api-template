import { Test, TestingModule } from "@nestjs/testing";
import { HealthCheckService, MemoryHealthIndicator } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return health check result", () => {
    const expectedResult = { status: "ok" };
    mockHealthCheckService.check.mockReturnValue(expectedResult);

    const result = controller.check();

    expect(mockHealthCheckService.check).toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });
});
