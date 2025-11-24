import { Entity, Property, t } from '@mikro-orm/postgresql'
import { EntityBase } from './entity-base'

@Entity({ tableName: 'users' })
export class User extends EntityBase {
  @Property({
    type: t.text,
    length: 10,
    nullable: false,
    comment: '用户昵称',
  })
  name: string

  @Property({
    type: t.text,
    length: 32,
    nullable: false,
    unique: true,
    comment: '邮件',
  })
  email: string

  @Property({
    type: t.text,
    length: 255,
    nullable: false,
    comment: '密码',
  })
  password: string

  @Property({
    type: t.tinyint,
    comment: '状态：0（用户正常），1（未校验邮箱），2（账号被封禁）',
    default: 0,
  })
  status: number

  @Property({
    type: t.datetime,
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt?: Date
}
