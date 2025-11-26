import { Entity, ManyToOne, Property, t } from '@mikro-orm/postgresql'
import { EntityBase } from './entity-base'
import { User } from './user.entity'

@Entity({ tableName: 'books' })
export class Book extends EntityBase {
  @Property({
    type: t.text,
    length: 200,
    nullable: false,
    comment: '图书名称',
  })
  title: string

  @Property({
    type: t.text,
    length: 100,
    nullable: false,
    comment: '作者',
  })
  author: string

  @Property({
    type: t.text,
    length: 100,
    nullable: false,
    comment: '出版社',
  })
  publisher: string

  @Property({
    type: t.text,
    length: 20,
    nullable: false,
    unique: true,
    comment: 'ISBN编号',
  })
  isbn: string

  @Property({
    type: t.text,
    length: 500,
    nullable: true,
    comment: '图书描述',
  })
  description?: string

  @Property({
    type: t.datetime,
    nullable: true,
    comment: '出版日期',
  })
  publishDate?: Date

  @Property({
    type: t.integer,
    nullable: true,
    comment: '页数',
  })
  pages?: number

  @ManyToOne(() => User, { nullable: false, comment: '所属用户' })
  user: User

  @Property({
    type: t.tinyint,
    comment: '状态：0（正常），1（已删除）',
    default: 0,
  })
  status: number
}
