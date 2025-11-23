import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Book } from 'src/db/entities/book.entity'
import { BookController } from './book.controller'
import { BookService } from './book.service'

@Module({
  controllers: [BookController],
  providers: [BookService],
  imports: [
    MikroOrmModule.forFeature([Book]),
  ],
})
export class BookModule {}
