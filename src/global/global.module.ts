import process from 'node:process'
import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule, Params } from 'nestjs-pino'
import pino from 'pino'
import { CronjobService } from './cronjob/cronjob.service'
import { DbModule } from './db/db.module'
import { HttpMessageService } from './http-message/http-message.service'
import { IdService } from './id/id.service'
import { RedisModule } from './redis/redis.module'

@Global()
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        // load remote config
        async () => {
          const isProd = process.env.NODE_ENV === 'prod'

          return {
            IS_PROD: isProd,
          }
        },
      ],
    }),
    DbModule,
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST', '127.0.0.1'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        keyPrefix: configService.get('REDIS_KEY_PREFIX'),
        enableOfflineQueue: configService.get('REDIS_ENABLE_OFFLINE_QUEUE', true),
        maxRetriesPerRequest: configService.get('REDIS_MAX_RETRIES', 3),
      }),
      inject: [ConfigService],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            customReceivedObject(req) {
              return {
                msg: 'request in',
                path: req.url,
                mathod: req.method,
              }
            },
            customSuccessObject(req, res, val) {
              return {
                path: req.url,
                mathod: req.method,
                status: res.statusCode,
                cost: val.responseTime,
              }
            },
            customErrorObject(req, res, _error, val) {
              return {
                path: req.url,
                mathod: req.method,
                status: res.statusCode,
                cost: val.responseTime,
              }
            },
            quietReqLogger: true,
            quietResLogger: true,
            level: config.get('LOG_LEVEL', 'info'),
            transport: process.env.NODE_ENV === 'production'
              ? undefined
              : { target: 'pino-pretty' },
            stream: process.env.NODE_ENV === 'production'
              ? pino.destination({
                  dest: './app.log',
                  minLength: 4096,
                  sync: false,
                  append: true,
                })
              : void 0,
          },

        } as Params
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get('THROTTLE_TTL', 60000), // 60秒
            limit: config.get('THROTTLE_LIMIT', 60), // 100次请求
          },
          {
            name: 'short',
            ttl: config.get('SHORT_THROTTLE_TTL', 20),
            limit: config.get('SHORT_THROTTLE_LIMIT', 10),
          },
        ],
      }),
    }),
  ],
  providers: [IdService, CronjobService, HttpMessageService],
  exports: [IdService, HttpMessageService],
})
export class GlobalModule {}
