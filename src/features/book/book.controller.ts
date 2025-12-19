import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "src/aspects/decorators/context.decorator";
import { AuthGuard } from "src/aspects/guards/auth.guard";
import { BookQueryDto, CreateBookDto, UpdateBookDto } from "./book.dto";
import { BookService } from "./book.service";

@Controller("api/book")
@UseGuards(AuthGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateBookDto, @CurrentUser() user: AuthedUser) {
    // 从session中获取用户ID
    const book = await this.bookService.create(user.id, body);

    return book;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: BookQueryDto, @CurrentUser() user: AuthedUser) {
    // 从session中获取用户ID
    const result = await this.bookService.findAll(user.id, query);

    return result;
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthedUser) {
    const book = await this.bookService.findOne(user.id, id);

    return book;
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateBookDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const book = await this.bookService.update(user.id, id, body);

    return book;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string, @CurrentUser() currentUser: AuthedUser) {
    // 从session中获取用户ID
    await this.bookService.remove(currentUser.id, id);

    return "o";
  }
}
