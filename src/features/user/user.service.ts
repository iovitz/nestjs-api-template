import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { User } from 'src/db/entities/user.entity'
import { IdService } from 'src/services/id/id.service'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly idService: IdService,
  ) {}

  async createUser(userData: Pick<User, 'name' | 'email' | 'password'>) {
    const user = this.userRepository.create({
      id: this.idService.genPrimaryKey(),
      ...userData,
      status: 1,
    })

    await this.em.flush()

    return user
  }
}
