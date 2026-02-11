import { OptionalProps, PrimaryKey, Property, raw } from "@mikro-orm/postgresql";

export abstract class EntityBase {
  [OptionalProps]?: "createdAt" | "updatedAt";

  @PrimaryKey({
    type: "string",
    comment: "主键（雪花ID）",
  })
  id: string;

  @Property({
    type: "timestamp",
    comment: "创建时间",
    default: raw("CURRENT_TIMESTAMP"),
  })
  createdAt: Date;

  @Property({
    type: "timestamp",
    comment: "更新时间",
    default: raw("CURRENT_TIMESTAMP"),
    onUpdate: raw("CURRENT_TIMESTAMP"),
  })
  updatedAt: Date;
}
