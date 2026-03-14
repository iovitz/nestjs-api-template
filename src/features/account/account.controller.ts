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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentAccount } from "src/aspects/decorators/context.decorator";
import { AuthGuard } from "src/aspects/guards/auth.guard";
import { HttpContextService } from "src/global/http-context/http-context.service";
import { LoginDto, RegisterDto } from "./account.dto";
import { AccountService } from "./account.service";

@ApiTags("账户")
@Controller("api/account")
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly httpContextService: HttpContextService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "注册账户" })
  @ApiResponse({ status: 201, description: "注册成功" })
  async register(@Body() body: RegisterDto) {
    const account = await this.accountService.register(body);

    return account;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "登录账户" })
  @ApiResponse({ status: 200, description: "登录成功，返回账户信息" })
  async login(@Body() body: LoginDto) {
    const result = await this.accountService.login(body);

    // 使用CookieService设置会话Cookie
    this.httpContextService.setCookie("session", result.sessionId);

    return result.account;
  }

  @Get("profile")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前账户信息" })
  @ApiResponse({ status: 200, description: "获取成功" })
  @ApiResponse({ status: 401, description: "未授权" })
  async getProfile(@CurrentAccount() currentAccount: AuthedAccount) {
    // 从Redis获取session数据
    const sessionData = await this.accountService.getSessionData(currentAccount.session);
    if (!sessionData) {
      throw new Error("会话已过期");
    }

    const account = await this.accountService.findById(sessionData.id);
    return account;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "退出登录" })
  @ApiResponse({ status: 401, description: "退出成功" })
  async logout(@CurrentAccount() account: AuthedAccount) {
    // 调用service进行登出处理
    await this.accountService.logout(account.session);

    // 清除Cookie
    this.httpContextService.clearCookie("session");

    throw new UnauthorizedException("已登出");
  }
}
