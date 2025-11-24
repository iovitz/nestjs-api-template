import { EntityManager, EntityRepository, FilterQuery, FindAllOptions, LoadStrategy, OrderDefinition, RequiredEntityData, wrap } from '@mikro-orm/postgresql'
import { ConfigService } from '@nestjs/config'
import { Snowflake } from '@sapphire/snowflake'
import { EntityBase } from 'src/global/db/entities/entity-base'

export abstract class DaoService<T extends EntityBase, E extends EntityRepository<T> = EntityRepository<T>> {
  readonly abstract entity: E
  readonly abstract em: EntityManager
  private primaryKeyGenerator: Snowflake

  constructor(
    readonly configService: ConfigService,
  ) {
    const time = new Date(configService.get('SNOWFLAKE_EPOCH') ?? '2000-01-01T00:00:00.000Z')
    this.primaryKeyGenerator = new Snowflake(time)
  }

  genPrimaryKey() {
    return this.primaryKeyGenerator.generate().toString()
  }

  async create(data: RequiredEntityData<T, never>) {
    const entity = this.entity.create({
      id: this.genPrimaryKey(),
      ...data,
    })
    await this.em.flush()
    return entity
  }

  find(options: FindAllOptions<T>) {
    return this.entity.findAll(options)
  }

  findOne(options: FilterQuery<T>) {
    return this.entity.findOne(options)
  }

  findOneOrFail(options: FilterQuery<T>) {
    return this.entity.findOneOrFail(options)
  }

  async update(idOrEntity: string | T, data: Partial<T>) {
    const entity = typeof idOrEntity === 'string' ? await this.entity.findOneOrFail({ id: idOrEntity } as FilterQuery<T>) : idOrEntity

    wrap(entity!).assign(data as any)
    await this.em.flush()

    return entity
  }

  /**
   * 删除实体
   * @param idOrEntity 实体ID或实体对象
   */
  async delete(idOrEntity: string | T): Promise<number> {
    const entity = typeof idOrEntity === 'string' ? await this.entity.findOneOrFail({ id: idOrEntity } as FilterQuery<T>) : idOrEntity
    this.em.remove(entity)
    await this.em.flush()
    return 1
  }

  /**
   * 批量删除实体
   * @param where 删除条件
   */
  async deleteMany(where: FilterQuery<T>): Promise<number> {
    return this.entity.nativeDelete(where)
  }

  /**
   * 检查实体是否存在
   * @param where 查询条件
   */
  async exists(where: FilterQuery<T>): Promise<boolean> {
    const count = await this.entity.count(where)
    return count > 0
  }

  /**
   * 获取实体总数
   * @param where 查询条件
   */
  async count(where: FilterQuery<T> = {}): Promise<number> {
    return this.entity.count(where)
  }

  /**
   * 分页查询
   * @param where 查询条件
   * @param orderBy 排序字段
   * @param limit 每页数量
   * @param offset 偏移量
   */
  async findAndCount(
    where: FilterQuery<T> = {},
    orderBy: OrderDefinition<T>,
    limit = 10,
    offset = 0,
  ): Promise<[T[], number]> {
    return this.entity.findAndCount(where, {
      limit,
      offset,
      strategy: LoadStrategy.SELECT_IN,
      orderBy,
    })
  }

  /**
   * 根据ID查找实体
   * @param id 实体ID
   */
  async findById(id: string) {
    return this.entity.findOneOrFail({ id } as FilterQuery<T>)
  }

  /**
   * 根据ID查找实体，如果不存在则抛出异常
   * @param id 实体ID
   */
  findByIdOrFail(id: string) {
    return this.entity.findOneOrFail({ id } as FilterQuery<T>)
  }

  /**
   * 创建或更新实体（如果存在则更新，不存在则创建）
   * @param data 实体数据
   * @param _where 查询条件（已废弃，使用upsert不需要手动指定查询条件）
   */
  async upsert(data: RequiredEntityData<T>, _where?: FilterQuery<T>) {
    // 使用MikroORM的原生upsert方法
    const result = await this.entity.upsert(data as any, {
      onConflictFields: ['id'],
      onConflictAction: 'merge',
    })

    return result
  }

  /**
   * 批量创建实体
   * @param dataList 实体数据列表
   */
  async createMany(dataList: RequiredEntityData<T>[]) {
    const entities = dataList.map(data =>
      this.entity.create({
        id: this.genPrimaryKey(),
        ...data,
      }),
    )

    await this.em.flush()
    return entities
  }

  /**
   * 原生SQL查询
   * @param sql SQL语句
   * @param params 参数
   */
  async nativeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.em.getConnection().execute(sql, params)
  }

  /**
   * 刷新实体（从数据库重新加载）
   * @param entity 实体对象
   */
  async refresh(entity: T): Promise<void> {
    await this.em.refresh(entity)
  }

  /**
   * 清除实体管理器中的所有实体
   */
  clear(): void {
    this.em.clear()
  }

  /**
   * 事务执行
   * @param callback 事务回调函数
   */
  async transaction<R>(callback: (em: EntityManager) => Promise<R>): Promise<R> {
    return this.em.transactional(callback)
  }
}
