import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Book } from 'src/global/db/entities/book.entity'
import { User } from 'src/global/db/entities/user.entity'
import { IdService } from 'src/global/id/id.service'
import { SortDto } from 'src/shared/dto/sort.dto'
import { BookQueryDto, CreateBookDto, UpdateBookDto } from './book.dto'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: EntityRepository<Book>,
    @InjectRepository(User) private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly idService: IdService,
  ) {}

  async create(userId: string, createBookDto: CreateBookDto): Promise<any> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({ id: userId })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 检查ISBN是否已存在
    const existingBook = await this.bookRepository.findOne({
      isbn: createBookDto.isbn,
      status: 0, // 只检查正常状态的图书
    })
    if (existingBook) {
      throw new ConflictException('该ISBN的图书已存在')
    }

    // 创建图书
    const book = this.bookRepository.create({
      id: this.idService.genPrimaryKey(),
      ...createBookDto,
      user,
      status: 0, // 正常状态
    })

    await this.em.persistAndFlush(book)

    return this.sanitizeBookData(book)
  }

  async findAll(userId: string, query: BookQueryDto & SortDto & { limit?: number, offset?: number }): Promise<any> {
    const { title, author, publisher, limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = query

    // 构建查询条件
    const whereConditions: any = {
      user: { id: userId },
      status: 0, // 只查询正常状态的图书
    }

    if (title) {
      whereConditions.title = { $like: `%${title}%` }
    }
    if (author) {
      whereConditions.author = { $like: `%${author}%` }
    }
    if (publisher) {
      whereConditions.publisher = { $like: `%${publisher}%` }
    }

    // 查询总数
    const total = await this.bookRepository.count(whereConditions)

    // 查询图书列表
    const books = await this.bookRepository.find(whereConditions, {
      limit,
      offset,
      orderBy: { [sortBy]: sortOrder.toLowerCase() },
    })

    return {
      list: books.map(book => this.sanitizeBookData(book)),
      total,
      limit,
      offset,
    }
  }

  async findOne(userId: string, id: string): Promise<any> {
    const book = await this.bookRepository.findOne({
      id,
      user: { id: userId },
      status: 0,
    })

    if (!book) {
      throw new NotFoundException('图书不存在')
    }

    return this.sanitizeBookData(book)
  }

  async update(userId: string, id: string, updateBookDto: UpdateBookDto): Promise<any> {
    const book = await this.bookRepository.findOne({
      id,
      user: { id: userId },
      status: 0,
    })

    if (!book) {
      throw new NotFoundException('图书不存在')
    }

    // 如果更新了ISBN，检查新ISBN是否已存在
    if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
      const existingBook = await this.bookRepository.findOne({
        isbn: updateBookDto.isbn,
        status: 0,
      })
      if (existingBook) {
        throw new ConflictException('该ISBN的图书已存在')
      }
    }

    // 更新图书信息
    Object.assign(book, updateBookDto)
    await this.em.persistAndFlush(book)

    return this.sanitizeBookData(book)
  }

  async remove(userId: string, id: string) {
    const book = await this.bookRepository.findOne({
      id,
      user: { id: userId },
      status: 0,
    })

    if (!book) {
      throw new NotFoundException('图书不存在')
    }

    // 软删除，将状态设置为已删除
    book.status = 1
    await this.em.persistAndFlush(book)

    return { message: '删除成功' }
  }

  private sanitizeBookData(book: Book) {
    const { user, ...bookData } = book
    return {
      ...bookData,
      userId: user.id,
      userName: user.name,
    }
  }
}
