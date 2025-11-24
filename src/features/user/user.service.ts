import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql'
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import argon2 from 'argon2'
import { omit } from 'es-toolkit'
import { User } from 'src/global/db/entities/user.entity'
import { IdService } from 'src/global/id/id.service'
import { LoginDto, RegisterDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly idService: IdService,
  ) {}

  async register({ name, email, password }: RegisterDto) {
    // TODO 校验验证码

    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOne({ email })
    if (existingUser) {
      throw new ConflictException('邮箱已被注册')
    }

    // 加密密码
    const hashedPassword = await argon2.hash(password)

    // 创建用户
    const user = this.userRepository.create({
      id: this.idService.genPrimaryKey(),
      name,
      email,
      password: hashedPassword,
      status: 0, // 正常状态
    })

    await this.em.persistAndFlush(user)

    // 返回用户信息（不包含密码）
    return omit(user, ['password'])
  }

  async login({ email, password }: LoginDto) {
    // TODO 校验验证码

    // 查找用户
    const user = await this.userRepository.findOne({ email })
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 验证密码
    const isPasswordValid = await argon2.verify(user.password, password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 检查用户状态
    if (user.status !== 0) {
      throw new UnauthorizedException('账号状态异常')
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date()
    await this.em.persistAndFlush(user)

    return this.sanitizeUserData(user)
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ id })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return this.sanitizeUserData(user)
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ email })
    if (!user) {
      return null
    }

    return this.sanitizeUserData(user)
  }

  async sanitizeUserData(user: User) {
    return omit(user, ['password', 'createdAt'])
  }
}
