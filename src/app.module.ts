import { HttpStatus, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { DefaultFilter } from './aspects/filters/default/default.filter'
import { HttpFilter } from './aspects/filters/http/http.filter'
import { ValidationFilter } from './aspects/filters/validation/validation.filter'
import { ThrottlerGuard } from './aspects/guards/throttler.guard'
import { FormatterInterceptor } from './aspects/interceptors/formatter/formatter.interceptor'
import { FeaturesModule } from './features/features.module'
import { GlobalModule } from './global/global.module'

@Module({
  imports: [
    GlobalModule,
    FeaturesModule,
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

    // #region Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
