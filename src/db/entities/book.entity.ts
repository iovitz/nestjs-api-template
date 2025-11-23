import { Entity, Property, t } from '@mikro-orm/postgresql'
import { EntityBase } from './entity-base'

@Entity({ tableName: 'books' })
export class Book extends EntityBase {
  @Property({
    type: t.text,
    length: 10,
    nullable: false,
  })
  name: string
}
