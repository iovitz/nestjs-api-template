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
    dbName: options?.dbName ?? process.env.DB_NAME, // 数据库名
    host: options?.host ?? process.env.DB_HOST, // 数据库地址
    port: options?.port || Number(process.env.DB_PORT) || 5432, // 端口（MySQL 默认 3306，PostgreSQL 5432）
    user: options?.user ?? process.env.DB_USER, // 用户名
    password: options?.password ?? process.env.DB_PASSWORD, // 密码

    // 2. 实体配置
    entities: ["dist/**/entities/*.entity.js"], // 编译后的实体路径（TS 项目必填，需与 tsconfig 输出目录一致）
    entitiesTs: ["src/**/entities/*.entity.ts"], // 源码实体路径（用于 CLI 命令如迁移、生成实体）
  };

  // 只在Cli运行时添加迁移配置
  if (!isCli) {
    try {
      return defineConfig({
        ...baseConfig,
        extensions: [require("@mikro-orm/migrations").Migrator],
        migrations: {
          tableName: "mikro_orm_migrations", // 迁移历史记录表名
          path: "migrations", // 编译后的迁移文件路径
          glob: "!(*.d).{js,ts}", // 迁移文件匹配模式
          silent: false, // 是否静默模式
          transactional: true, // 是否使用事务
          disableForeignKeys: false, // 是否禁用外键检查
          allOrNothing: true, // 是否全部迁移或全部不迁移
          dropTables: true, // 是否允许删除表
          safe: true, // 是否安全模式（不删除列）
          snapshot: true, // 是否生成快照文件
        },
      });
    } catch (error) {
      console.warn("迁移模块加载失败，将以基础配置继续:", error);
      return defineConfig(baseConfig);
    }
  }

  return defineConfig(baseConfig);
}
