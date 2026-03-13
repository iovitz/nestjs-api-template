import { OptionalProps } from "@mikro-orm/core";
import { PrimaryKey, Property } from "@mikro-orm/decorators/legacy";

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
    defaultRaw: "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Property({
    type: "timestamp",
    comment: "更新时间",
    defaultRaw: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
