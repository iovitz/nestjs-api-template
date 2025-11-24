import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/aspects/guards/auth.guard'
import { LoginDto, RegisterDto } from './user.dto'
import { UserService } from './user.service'

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    const user = await this.userService.register(body)

    return {
      message: '注册成功',
      data: user,
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const user = await this.userService.login(body)

    return {
      message: '登录成功',
      data: user,
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() request: FastifyRequest) {
    const userId = request.cookies.userId
    if (!userId) {
      throw new Error('用户未登录')
    }

    const user = await this.userService.findById(userId)
    return {
      message: '获取用户信息成功',
      data: user,
    }
  }
}
