import { DynamicModule, Module, Provider } from '@nestjs/common'
import Redis, { RedisOptions } from 'ioredis'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')

export interface RedisModuleOptions {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  enableOfflineQueue?: boolean
  maxRetriesPerRequest?: number
}

export interface RedisModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions
  inject?: any[]
}

export interface RedisModuleOptionsProvider {
  createRedisOptions: () => Promise<RedisModuleOptions> | RedisModuleOptions
}

// https://github.com/redis/ioredis
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions = {}): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redisOptions: RedisOptions = {
          host: options.host || '127.0.0.1',
          port: options.port || 6379,
          password: options.password || undefined,
          db: options.db || 0,
          keyPrefix: options.keyPrefix || undefined,
          enableOfflineQueue: options.enableOfflineQueue !== false,
          maxRetriesPerRequest: options.maxRetriesPerRequest || 3,
        }
        const redis = new Redis(redisOptions)
        return redis
      },
    }

    return {
      module: RedisModule,
      providers: [redisProvider],
      exports: [REDIS_CLIENT],
      global: true,
    }
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [{
        provide: REDIS_CLIENT,
        useFactory: async (...args: any[]) => {
          const redisModuleOptions = await options.useFactory!(...args)
          const redisOptions: RedisOptions = {
            host: redisModuleOptions.host || '127.0.0.1',
            port: redisModuleOptions.port || 6379,
            password: redisModuleOptions.password || undefined,
            db: redisModuleOptions.db || 0,
            keyPrefix: redisModuleOptions.keyPrefix || undefined,
            enableOfflineQueue: redisModuleOptions.enableOfflineQueue !== false,
            maxRetriesPerRequest: redisModuleOptions.maxRetriesPerRequest || 3,
          }
          return new Redis(redisOptions)
        },
        inject: options.inject || [],
      }],
      exports: [REDIS_CLIENT],
      global: true,
    }
  }
}
