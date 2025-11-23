import process from 'node:process'
import { HttpModule } from '@nestjs/axios'
import { CacheModule } from '@nestjs/cache-manager'
import { HttpStatus, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { LoggerModule, Params } from 'nestjs-pino'
import pino from 'pino'
import { DefaultFilter } from './aspects/filters/default/default.filter'
import { HttpFilter } from './aspects/filters/http/http.filter'
import { ValidationFilter } from './aspects/filters/validation/validation.filter'
import { FormatterInterceptor } from './aspects/interceptors/formatter/formatter.interceptor'
import { DbModule } from './db/db.module'
import { FeaturesModule } from './features/features.module'
import { ServicesModule } from './services/services.module'

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
    ServicesModule,
    FeaturesModule,
    DbModule,
  ],

  providers: [
    // #region Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatterInterceptor,
    },
    // #endregion

    // #region Pipes
    {
      provide: APP_PIPE,
      useFactory() {
        return new ValidationPipe({
          // 使用422作为校验失败错误码
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory(errors) {
            return errors[0]
          },
        })
      },
    },
    // #endregion

    // #region Filters
    // 执行顺序从下到上
    {
      provide: APP_FILTER,
      useClass: DefaultFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationFilter,
    },
    // #endregion
  ],

})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
      )
      .forRoutes('*')
  }
}
