import process from "node:process";
import { defineConfig } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import "dotenv/config";

interface DBOptions {
  dbName: string;
  host: string;
  port: number;
  user: string;
  password: string;
}

/**
 * 封装函数用来消除代码中使用和控制台Cli调用时的差异
 * @param _context 上下文，默认为 default
 * @param options DB链接选项
 * @returns DB连接诶参数
 */
export default function getMikroORMConfig(_context: string, options?: DBOptions) {
  const isCli = !!options;

  // 基础配置
  const baseConfig = {
    // 1. 数据库核心配置
    driver: PostgreSqlDriver,
    dbName: options?.dbName ?? process.env.POSTGRE_NAME,
    host: options?.host ?? process.env.POSTGRE_HOST,
    port: options?.port || Number(process.env.POSTGRE_PORT) || 5432,
    user: options?.user ?? process.env.POSTGRE_USER,
    password: options?.password ?? process.env.POSTGRE_PASSWORD,

    // 2. 实体配置
    entities: ["dist/**/entities/*.entity.js"], // 编译后的实体路径（TS 项目必填，需与 tsconfig 输出目录一致）
    entitiesTs: ["src/**/entities/*.entity.ts"], // 源码实体路径（用于 CLI 命令如迁移、生成实体）
  };

  // 只在Cli运行时添加迁移配置
  if (!isCli) {
    try {
      return defineConfig({
        ...baseConfig,
        extensions: [
          require("@mikro-orm/migrations").Migrator,
          require("@mikro-orm/seeder").SeedManager,
        ],
        migrations: {
          tableName: "mikro_orm_migrations", // 迁移历史记录表名
          path: "src/global/db/migrations", // 编译后的迁移文件路径
          glob: "!(*.d).{js,ts}", // 迁移文件匹配模式
          silent: false, // 是否静默模式
          transactional: true, // 是否使用事务
          disableForeignKeys: false, // 是否禁用外键检查
          allOrNothing: true, // 是否全部迁移或全部不迁移
          dropTables: true, // 是否允许删除表
          safe: true, // 是否安全模式（不删除列）
          snapshot: true, // 是否生成快照文件
        },
        seeder: {
          path: "dist/global/db/seeders", // 编译后的种子文件路径
          pathTs: "src/global/db/seeders", // TypeScript 种子文件路径
          defaultSeeder: "DatabaseSeeder", // 默认种子执行器
          emit: "ts", // 种子文件格式
          glob: "seeder.ts", // 匹配模式
          fileName: (className: string) => {
            const cleanName = className.replace(/Seeder/g, ".seeder");
            const kebabCase = cleanName
              .replace(/([a-z])([A-Z])/g, "$1-$2") // 小写字母和大写字母之间加短横线
              .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2") // 连续大写字母后跟大写字母加小写字母
              .toLowerCase();
            return kebabCase;
          }, // 文件命名规则
        },
      });
    } catch (error) {
      console.warn("迁移模块加载失败，将以基础配置继续:", error);
      return defineConfig(baseConfig);
    }
  }

  return defineConfig(baseConfig);
}
