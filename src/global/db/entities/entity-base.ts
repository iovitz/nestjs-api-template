import { OptionalProps, PrimaryKey, Property, t } from "@mikro-orm/postgresql";

export abstract class EntityBase {
  [OptionalProps]?: "createdAt" | "updatedAt";

  @PrimaryKey({
    type: "string",
    comment: "主键（雪花ID）",
  })
  id: string;

  @Property({
    type: t.datetime,
    comment: "时间",
  })
  createdAt = new Date();

  @Property({
    type: t.datetime,
    onUpdate: () => new Date(),
  })
  updatedAt = new Date();
}
