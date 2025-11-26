import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Book } from 'src/global/db/entities/book.entity'
import { User } from 'src/global/db/entities/user.entity'
import { IdService } from 'src/global/id/id.service'
import { BookController } from './book.controller'
import { BookService } from './book.service'

@Module({
  imports: [MikroOrmModule.forFeature([Book, User])],
  controllers: [BookController],
  providers: [BookService, IdService],
})
export class BookModule {}
