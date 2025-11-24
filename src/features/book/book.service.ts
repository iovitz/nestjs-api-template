import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Book } from 'src/global/db/entities/book.entity'
import { DaoService } from 'src/shared/service/dao.service'

@Injectable()
export class BookService extends DaoService<Book> {
  constructor(
    readonly configService: ConfigService,
    readonly em: EntityManager,
    @InjectRepository(Book) readonly entity: EntityRepository<Book>,
  ) {
    super(configService)
  }

  getBookByPaging(where: FilterQuery<Book>, limit: number, offset: number) {
    const books = this.find({
      where,
      limit,
      offset,
    })
    return books
  }

  async addBook(name: string) {
    const book = await this.create({
      name,
    })

    return book
  }
}
