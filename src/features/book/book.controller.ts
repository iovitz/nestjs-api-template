import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from 'src/global/redis/redis.module'
import { AddBookDto, GetBookDto } from './book.dto'
import { BookService } from './book.service'

@Controller('/api/book')
export class BookController {
  @Inject()
  bookService: BookService

  @Inject(REDIS_CLIENT)
  redisClient: Redis

  @Get()
  async getBooks(@Query() query: GetBookDto) {
    const books = this.bookService.getBookByPaging({}, query.limit, query.offset)
    return books
  }

  @Post('create')
  async addBook(@Body() body: AddBookDto) {
    const newBook = await this.bookService.addBook(body.name)

    return newBook
  }
}
