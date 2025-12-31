import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "src/aspects/decorators/context.decorator";
import { AuthGuard } from "src/aspects/guards/auth.guard";
import { HttpContextService } from "src/global/http-context/http-context.service";
import { LoginDto, RegisterDto } from "./user.dto";
import { UserService } from "./user.service";

@Controller("api/user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly httpContextService: HttpContextService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    const user = await this.userService.register(body);

    return user;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const result = await this.userService.login(body);

    // 使用CookieService设置会话Cookie
    this.httpContextService.setCookie("session", result.sessionId);

    return result.user;
  }

  @Get("profile")
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() currentUser: AuthedUser) {
    // 从Redis获取session数据
    const sessionData = await this.userService.getSessionData(currentUser.session);
    if (!sessionData) {
      throw new Error("会话已过期");
    }

    const user = await this.userService.findById(sessionData.userId);
    return user;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() currentUser: AuthedUser) {
    // 调用service进行登出处理
    await this.userService.logout(currentUser.session);

    // 清除Cookie
    this.httpContextService.clearCookie("session");

    throw new UnauthorizedException("已登出");
  }
}
