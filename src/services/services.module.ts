import { Global, Module } from '@nestjs/common'
import { CronjobService } from './cronjob/cronjob.service'
import { IdService } from './id/id.service'

@Global()
@Module({
  providers: [IdService, CronjobService],
  exports: [IdService],
})
export class ServicesModule {}
