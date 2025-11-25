import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from 'src/aspects/guards/auth.guard'
import { LoginDto, RegisterDto } from './user.dto'
import { UserService } from './user.service'

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
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
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.userService.login(body)

    // 将session写入cookie
    res.cookie('session', result.sessionId, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'prod',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
    })

    return {
      message: '登录成功',
      data: {
        user: result.user,
      },
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() request: FastifyRequest) {
    const sessionId = request.cookies.session
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
