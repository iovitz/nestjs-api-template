import { Test, TestingModule } from "@nestjs/testing";
import { HttpContextService } from "./http-context.service";

describe("httpContextService", () => {
  let service: HttpContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpContextService],
    }).compile();

    service = module.get<HttpContextService>(HttpContextService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
