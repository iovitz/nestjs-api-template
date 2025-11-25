import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/aspects/guards/auth.guard'
import { HttpMessageService } from 'src/global/http-message/http-message.service'
import { LoginDto, RegisterDto } from './user.dto'
import { UserService } from './user.service'

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly httpMessageService: HttpMessageService,
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
    const result = await this.userService.login(body)

    // 使用CookieService设置会话Cookie
    this.httpMessageService.setCookie('session', result.sessionId)

    return {
      message: '登录成功',
      data: {
        user: result.user,
      },
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile() {
    // 使用CookieService获取会话Cookie
    const sessionId = this.httpMessageService.getCookie('session')
    if (!sessionId) {
      throw new UnauthorizedException()
    }

    // 从Redis获取session数据
    const sessionData = await this.userService.getSessionData(sessionId)
    if (!sessionData) {
      throw new Error('会话已过期')
    }

    const user = await this.userService.findById(sessionData.userId)
    return {
      message: '获取用户信息成功',
      data: user,
    }
  }
}
