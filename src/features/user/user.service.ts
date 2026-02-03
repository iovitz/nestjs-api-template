import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { omit } from "es-toolkit";
import Redis from "ioredis";
import { User } from "src/global/db/entities/user.entity";
import { IdService } from "src/global/id/id.service";
import { REDIS_CLIENT } from "src/global/redis/redis.module";
import { LoginDto, RegisterDto } from "./user.dto";
import { CryptoService } from "src/global/crypto/crypto.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly cryptoService: CryptoService,
    private readonly idService: IdService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async register({ name, email, password }: RegisterDto) {
    // TODO 校验验证码

    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      throw new ConflictException("邮箱已被注册");
    }

    // 加密密码
    const hashedPassword = await this.cryptoService.hashPassword(password);

    // 创建用户
    const user = this.userRepository.create({
      id: this.idService.genPrimaryKey(),
      name,
      email,
      password: hashedPassword,
      status: 0, // 正常状态
    });

    await this.em.persistAndFlush(user);

    // 返回用户信息（不包含密码）
    return omit(user, ["password"]);
  }

  async login({ email, password }: LoginDto) {
    // TODO 校验验证码

    // 查找用户
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    // 验证密码
    const isPasswordValid = await this.cryptoService.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    // 检查用户状态
    if (user.status !== 0) {
      throw new UnauthorizedException("账号状态异常");
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.em.persistAndFlush(user);

    // 生成session并写入Redis
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      loginAt: new Date().toISOString(),
    };

    // 将session写入Redis，设置24小时过期时间
    await this.redisClient.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));

    // 返回用户数据和sessionId
    return {
      user: this.sanitizeUserData(user),
      sessionId,
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    return this.sanitizeUserData(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      return null;
    }

    return this.sanitizeUserData(user);
  }

  async sanitizeUserData(user: User) {
    return omit(user, ["password", "createdAt"]);
  }

  /**
   * 获取session数据
   */
  async getSessionData(sessionId: string) {
    const key = `session:${sessionId}`;
    const data = await this.redisClient.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * 用户登出
   */
  async logout(sessionId: string) {
    const key = `session:${sessionId}`;

    // 删除Redis中的session数据
    await this.redisClient.del(key);

    return true;
  }

  /**
   * 生成session ID
   */
  private generateSessionId(): string {
    return this.idService.genSnowflakeId();
  }
}
