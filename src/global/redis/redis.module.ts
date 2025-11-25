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
  useClass?: any
  useExisting?: any
}

export interface RedisModuleOptionsProvider {
  createRedisOptions: () => Promise<RedisModuleOptions> | RedisModuleOptions
}

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
        return new Redis(redisOptions)
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
    let redisProvider: Provider

    if (options.useFactory) {
      redisProvider = {
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
      }
    }
    else if (options.useClass) {
      redisProvider = {
        provide: REDIS_CLIENT,
        useFactory: async (optionsProvider: any) => {
          const redisModuleOptions = await optionsProvider.createRedisOptions()
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
        inject: [options.useClass],
      }
    }
    else if (options.useExisting) {
      redisProvider = {
        provide: REDIS_CLIENT,
        useFactory: async (optionsProvider: any) => {
          const redisModuleOptions = await optionsProvider.createRedisOptions()
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
        inject: [options.useExisting],
      }
    }
    else {
      throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting')
    }

    return {
      module: RedisModule,
      providers: [redisProvider],
      exports: [REDIS_CLIENT],
      global: true,
    }
  }
}
