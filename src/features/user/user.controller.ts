import { Body, Controller, Post } from '@nestjs/common'
import { CreateUserDTO } from './user.dto'
import { UserService } from './user.service'

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('create')
  async createUser(@Body() body: CreateUserDTO) {
    const res = await this.userService.createUser({
      ...body,
    })

    return res
  }
}
