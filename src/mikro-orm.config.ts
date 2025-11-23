import process from 'node:process'
import { defineConfig } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

interface DBOptions {
  dbName: string
  host: string
  port: number
  user: string
  password: string
}

/**
 * 封装函数用来消除代码中使用和控制台Cli调用时的差异
 * @param _context 上下文，默认为 default
 * @param options DB链接选项
 * @returns DB连接诶参数
 */
export default function getMikroORMConfig(_context: string, options?: DBOptions) {
  const config = defineConfig({
    // 1. 数据库核心配置
    driver: PostgreSqlDriver,
    dbName: options?.dbName ?? process.env.DB_NAME, // 数据库名
    host: options?.host ?? process.env.DB_HOST, // 数据库地址
    port: options?.port || Number(process.env.DB_PORT) || 5432, // 端口（MySQL 默认 3306，PostgreSQL 5432）
    user: options?.user ?? process.env.DB_USER, // 用户名
    password: options?.password ?? process.env.DB_PASSWORD, // 密码

    // 2. 实体配置
    entities: ['dist/db/entities/*.entity.js'], // 编译后的实体路径（TS 项目必填，需与 tsconfig 输出目录一致）
    entitiesTs: ['src/db/entities/*.entity.ts'], // 源码实体路径（用于 CLI 命令如迁移、生成实体）
  })
  return config
}
