import process from "node:process";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import systeminformation from "systeminformation";

@Injectable()
export class CronjobService {
  logger = new Logger(CronjobService.name);

  /**
   * 打印系统负载
   */
  @Cron("*/5 * * * *")
  async logSystemLoad() {
    const memoryUsage = process.memoryUsage();
    const loadStatus = await systeminformation.currentLoad();
    this.logger.log(
      {
        cpu: loadStatus.currentLoad.toFixed(2),
        cpu_cors: loadStatus.cpus.map((c) => `${c.load.toFixed(2)}%`),
        rss: Math.floor(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.floor(memoryUsage.external / 1024 / 1024),
        arrayBuffers: Math.floor(memoryUsage.arrayBuffers / 1024 / 1024),
      },
      `memory usage`,
    );
  }

  /**
   * 日志轮转
   */
  @Cron("*/60 * * * *")
  async logRotating() {
    // ...
  }
}
