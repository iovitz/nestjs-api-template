import process from 'node:process'
import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule, Params } from 'nestjs-pino'
import pino from 'pino'
import { CronjobService } from './cronjob/cronjob.service'
import { DbModule } from './db/db.module'
import { IdService } from './id/id.service'

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
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory() {
        return {
          isGlobal: true,
          ttl: 60 * 1000, // 改为60秒，更合理的缓存时间
          max: 100, // 增加缓存项数量
        }
      },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            customReceivedObject(req, res) {
              // 在这里注入LogID
              res.setHeader('x-log-id', req.id as string)
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
  providers: [IdService, CronjobService],
  exports: [IdService],
})
export class GlobalModule {}
