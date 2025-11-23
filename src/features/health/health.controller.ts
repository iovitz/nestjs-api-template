import { Controller, Get } from '@nestjs/common'
import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus'

@Controller('api/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ])
  }
}
